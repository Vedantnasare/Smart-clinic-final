package com.smartclinic.services;

import com.smartclinic.models.Token;
import com.smartclinic.models.QueueMetadata;
import com.smartclinic.repositories.TokenRepository;
import com.smartclinic.repositories.QueueMetadataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class QueueService {

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private QueueMetadataRepository queueMetadataRepository;

    @Autowired
    private SmsService smsService;

    @Autowired
    private WhatsAppService whatsappService;

    private final String HYPEREAL_API_KEY = "ck_5491c58546b11708d654f5d3846a6411305209e4595472a80cce08b60055a63b";
    private final String HYPEREAL_CHAT_API = "https://hypereal.tech/api/v1/chat";

    private static final int AVERAGE_SERVICE_TIME_MINS = 12;

    public Token generateToken(String patientName, String phoneNumber, LocalDate bookingDate, boolean emergency, String emergencyReason, String slot) {
        int nextTokenNumber = 1;
        Optional<Token> lastToken = tokenRepository.findFirstByBookingDateOrderByTokenNumberDesc(bookingDate);
        if (lastToken.isPresent()) {
            nextTokenNumber = lastToken.get().getTokenNumber() + 1;
        }

        Token token = new Token();
        token.setPatientName(patientName);
        token.setPhoneNumber(phoneNumber);
        token.setTokenNumber(nextTokenNumber);
        token.setBookingDate(bookingDate);
        token.setEmergency(emergency);
        token.setEmergencyReason(emergencyReason);
        token.setSlot(slot);
        token.setStatus(Token.Status.WAITING);
        token.setCreatedAt(LocalDateTime.now());

        String smartMessage = generateSmartMessage(patientName);
        token.setSmartMessage(smartMessage);
        
        Token savedToken = tokenRepository.save(token);

        boolean waSent = whatsappService.sendMessage(phoneNumber, smartMessage + " (Token #" + nextTokenNumber + " for " + bookingDate + ")");
        
        // Always One Serving Logic (per date)
        if (bookingDate.equals(LocalDate.now())) {
            List<Token> currentlyServing = tokenRepository.findByBookingDateAndStatus(bookingDate, Token.Status.CALLED);
            if (currentlyServing.isEmpty()) {
                savedToken.setStatus(Token.Status.CALLED);
                savedToken.setCalledAt(LocalDateTime.now());
                tokenRepository.save(savedToken);
            }
        }
        
        return savedToken;
    }

    public String generateSmartMessage(String name) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + HYPEREAL_API_KEY);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", "You are a helpful clinic assistant. Generate a short, friendly token confirmation message (1-2 sentences) for a patient. Include a tiny health tip."));
            messages.add(Map.of("role", "user", "content", "Patient Name: " + name));
            
            body.put("messages", messages);
            body.put("stream", false);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(HYPEREAL_CHAT_API, entity, Map.class);

            System.out.println("Hypereal AI Response Status: " + response.getStatusCode());
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
                if (responseBody != null && responseBody.containsKey("choices")) {
                    List<?> choices = (List<?>) responseBody.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
                        Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
                        return (String) message.get("content");
                    }
                }
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("Hypereal AI Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("Error calling Hypereal AI: " + e.getMessage());
            e.printStackTrace();
        }
        return "Your token has been generated. Please wait for your turn.";
    }

    public boolean isValidMedicalEmergency(String reason) {
        return true;
    }

    public List<Token> getAllTokens(LocalDate date) {
        return tokenRepository.findByBookingDateOrderByTokenNumberAsc(date);
    }

    public Token getTokenById(String id) {
        return tokenRepository.findById(id).orElse(null);
    }

    public Integer getCurrentlyServingTokenNumber(LocalDate date) {
        Optional<Token> currentToken = tokenRepository.findFirstByBookingDateAndStatusOrderByTokenNumberAsc(date, Token.Status.CALLED);
        return currentToken.map(Token::getTokenNumber).orElse(0);
    }

    public synchronized Token updateStatus(String id, Token.Status status) {
        Token token = tokenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        
        token.setStatus(status);
        if (status == Token.Status.CALLED) {
            token.setCalledAt(LocalDateTime.now());
            // Enforce Single Serving stricter
            List<Token> currentlyServing = tokenRepository.findByBookingDateAndStatus(token.getBookingDate(), Token.Status.CALLED);
            for (Token serving : currentlyServing) {
                if (!serving.getId().equals(id)) {
                    serving.setStatus(Token.Status.COMPLETED);
                    serving.setCompletedAt(LocalDateTime.now());
                    tokenRepository.save(serving);
                }
            }
        } else if (status == Token.Status.COMPLETED) {
            token.setCompletedAt(LocalDateTime.now());
            token = tokenRepository.save(token);
            
            // Auto-advance: Maintain 1 serving
            maintainServingCount(token.getBookingDate());
            return token;
        }
        
        return tokenRepository.save(token);
    }

    public void deleteToken(String id) {
        tokenRepository.findById(id).ifPresent(tokenToDelete -> {
            boolean wasServing = tokenToDelete.getStatus() == Token.Status.CALLED;
            tokenRepository.deleteById(id);

            if (wasServing) {
                maintainServingCount(tokenToDelete.getBookingDate());
            }
        });
    }

    public Map<String, Object> estimateWaitingTimestamp(int tokenNumber, LocalDate date) {
        List<Token> allTokens = tokenRepository.findByBookingDateOrderByTokenNumberAsc(date);
        Token thisToken = allTokens.stream().filter(t -> t.getTokenNumber() == tokenNumber).findFirst().orElse(null);
        
        Map<String, Object> response = new HashMap<>();
        if (thisToken == null || thisToken.getStatus() == Token.Status.COMPLETED || thisToken.getStatus() == Token.Status.CALLED) {
            response.put("secondsToGo", 0);
            return response;
        }
        
        long tokensAhead = 0;
        for (Token t : allTokens) {
            if (t.getStatus() == Token.Status.COMPLETED) continue;
            if (t.getStatus() == Token.Status.CALLED) {
                tokensAhead++;
                continue;
            }
            if (thisToken.isEmergency()) {
                if (t.isEmergency() && t.getTokenNumber() < tokenNumber) {
                    tokensAhead++;
                }
            } else {
                if (t.isEmergency()) {
                    tokensAhead++;
                } else if (!t.isEmergency() && t.getTokenNumber() < tokenNumber) {
                    tokensAhead++;
                }
            }
        }
        
        if (tokensAhead == 0) {
            response.put("secondsToGo", 0);
            return response;
        }
        
        int bufferMinutes = queueMetadataRepository.findByDate(date)
                .map(QueueMetadata::getBufferMinutes)
                .orElse(0);

        Optional<Token> serving = allTokens.stream().filter(t -> t.getStatus() == Token.Status.CALLED).findFirst();
        if (serving.isPresent()) {
            Optional<Token> firstWaiting = allTokens.stream().filter(t -> t.getStatus() == Token.Status.WAITING).findFirst();
            if (firstWaiting.isPresent()) {
                Token fw = firstWaiting.get();
                LocalDateTime fwArrival = fw.getCreatedAt()
                        .plusMinutes(AVERAGE_SERVICE_TIME_MINS)
                        .plusMinutes(bufferMinutes);
                long secsToFw = java.time.Duration.between(LocalDateTime.now(), fwArrival).toSeconds();
                
                while (secsToFw > -36000 && secsToFw <= 120) {
                    addBufferMinutes(date, 5);
                    bufferMinutes += 5;
                    fwArrival = fwArrival.plusMinutes(5);
                    secsToFw += 300;
                }
            }
        }

        LocalDateTime arrival = thisToken.getCreatedAt()
                .plusMinutes(tokensAhead * AVERAGE_SERVICE_TIME_MINS)
                .plusMinutes(bufferMinutes);

        long secondsToGo = java.time.Duration.between(LocalDateTime.now(), arrival).toSeconds();
        
        response.put("secondsToGo", Math.max(0, secondsToGo));
        response.put("estimatedArrival", arrival.toString());
        response.put("patientsAhead", tokensAhead);
        return response;
    }

    public long estimateWaitingTime(int tokenNumber, LocalDate date) {
        Map<String, Object> result = estimateWaitingTimestamp(tokenNumber, date);
        Object seconds = result.get("secondsToGo");
        if (seconds instanceof Number) {
            return ((Number) seconds).longValue() / 60;
        }
        return 0;
    }

    public void addBufferMinutes(LocalDate date, int minutes) {
        QueueMetadata metadata = queueMetadataRepository.findByDate(date)
                .orElse(new QueueMetadata());
        metadata.setDate(date);
        metadata.setBufferMinutes(metadata.getBufferMinutes() + minutes);
        queueMetadataRepository.save(metadata);
    }

    public void setDoctorAvailability(LocalDate date, boolean available) {
        QueueMetadata metadata = queueMetadataRepository.findByDate(date)
                .orElse(new QueueMetadata());
        metadata.setDate(date);
        metadata.setDoctorAvailable(available);
        queueMetadataRepository.save(metadata);
    }

    private synchronized void maintainServingCount(LocalDate date) {
        List<Token> currentlyServing = tokenRepository.findByBookingDateAndStatus(date, Token.Status.CALLED);
        if (currentlyServing.isEmpty()) {
            List<Token> waiting = tokenRepository.findByBookingDateOrderByTokenNumberAsc(date).stream()
                .filter(t -> t.getStatus() == Token.Status.WAITING).toList();
            
            Token next = waiting.stream().filter(Token::isEmergency).min(Comparator.comparingInt(Token::getTokenNumber))
                .orElse(waiting.stream().min(Comparator.comparingInt(Token::getTokenNumber)).orElse(null));

            if (next != null) {
                next.setStatus(Token.Status.CALLED);
                next.setCalledAt(LocalDateTime.now());
                tokenRepository.save(next);
            }
        }
    }

    public Token findTokenByNamePhoneAndDate(String name, String phone, LocalDate date) {
        List<Token> allForDate = tokenRepository.findByBookingDateOrderByTokenNumberAsc(date);
        
        String searchPhone = phone != null ? phone.replaceAll("[\\s\\-\\(\\)]", "") : "";
        String searchName = name != null ? name.trim() : "";
        
        return allForDate.stream()
                .filter(t -> t.getPhoneNumber() != null && t.getPhoneNumber().replaceAll("[\\s\\-\\(\\)]", "").equals(searchPhone))
                .filter(t -> t.getPatientName() != null && t.getPatientName().trim().equalsIgnoreCase(searchName))
                .max(Comparator.comparing(Token::getCreatedAt))
                .orElse(null);
    }

    public Map<String, Object> checkAvailability(LocalDate date) {
        Map<String, Object> response = new HashMap<>();

        QueueMetadata metadata = queueMetadataRepository.findByDate(date).orElse(null);
        if (metadata != null && !metadata.isDoctorAvailable()) {
            response.put("available", false);
            response.put("message", "Doctor is unavailable on this date.");
            return response;
        }

        /* 
        if (date.getDayOfWeek().getValue() == 7) { // Sunday
            response.put("available", false);
            response.put("message", "Clinic is closed on Sundays.");
            return response;
        }
        */

        List<Token> tokens = tokenRepository.findByBookingDateOrderByTokenNumberAsc(date);
        
        long morningCount = tokens.stream().filter(t -> "MORNING".equals(t.getSlot())).count();
        long afternoonCount = tokens.stream().filter(t -> "AFTERNOON".equals(t.getSlot())).count();
        long eveningCount = tokens.stream().filter(t -> "EVENING".equals(t.getSlot())).count();

        int maxPerSlot = 30;
        Map<String, Boolean> slots = new HashMap<>();
        slots.put("MORNING", morningCount < maxPerSlot);
        slots.put("AFTERNOON", afternoonCount < maxPerSlot);
        slots.put("EVENING", eveningCount < maxPerSlot);

        boolean isAnyAvailable = slots.containsValue(true);
        response.put("available", isAnyAvailable);
        if (!isAnyAvailable) {
            response.put("message", "All slots are fully booked for this date.");
        } else {
            response.put("message", "Slots available");
            response.put("slots", slots);
        }

        return response;
    }
}
