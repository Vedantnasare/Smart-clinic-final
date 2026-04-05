package com.smartclinic.controllers;

import com.smartclinic.models.Token;
import com.smartclinic.services.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tokens")
@CrossOrigin(origins = "*") // Allow frontend access
public class QueueController {

    @Autowired
    private QueueService queueService;

    @PostMapping("/generate")
    public Token generateToken(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String phone = (String) request.get("phone");
        String dateStr = (String) request.get("bookingDate");
        LocalDate bookingDate = (dateStr != null) ? LocalDate.parse(dateStr) : LocalDate.now();
        boolean emergency = request.containsKey("emergency") && (Boolean) request.get("emergency");
        String emergencyReason = (String) request.get("emergencyReason");
        String slot = (String) request.get("slot");
        
        if (emergency && !queueService.isValidMedicalEmergency(emergencyReason)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Not a valid medical emergency.");
        }
        
        return queueService.generateToken(name, phone, bookingDate, emergency, emergencyReason, slot);
    }

    @GetMapping("/all")
    public List<Token> getAllTokens(@RequestParam(value = "date", required = false) String dateStr) {
        LocalDate date = (dateStr != null) ? LocalDate.parse(dateStr) : LocalDate.now();
        return queueService.getAllTokens(date);
    }

    @GetMapping("/{id}")
    public Token getTokenById(@PathVariable("id") String id) {
        return queueService.getTokenById(id);
    }

    @GetMapping("/currently-serving")
    public Integer getCurrentlyServingTokenNumber(@RequestParam(value = "date", required = false) String dateStr) {
        LocalDate date = (dateStr != null) ? LocalDate.parse(dateStr) : LocalDate.now();
        return queueService.getCurrentlyServingTokenNumber(date);
    }

    @PutMapping("/{id}/status")
    public Token updateStatus(@PathVariable("id") String id, @RequestBody Map<String, String> request) {
        Token.Status status = Token.Status.valueOf(request.get("status"));
        return queueService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void deleteToken(@PathVariable("id") String id) {
        queueService.deleteToken(id);
    }

    @GetMapping("/estimate/{tokenNumber}")
    public Map<String, Object> getEstimatedTime(@PathVariable("tokenNumber") int tokenNumber,
                                 @RequestParam(value = "date", required = false) String dateStr) {
        LocalDate date = (dateStr != null) ? LocalDate.parse(dateStr) : LocalDate.now();
        return queueService.estimateWaitingTimestamp(tokenNumber, date);
    }

    @GetMapping("/message/{name}")
    public String getSmartMessage(@PathVariable("name") String name) {
        return queueService.generateSmartMessage(name);
    }

    @GetMapping("/find")
    public Token findToken(@RequestParam("name") String name, @RequestParam("phone") String phone, @RequestParam("date") String date) {
        LocalDate bookingDate = LocalDate.parse(date);
        return queueService.findTokenByNamePhoneAndDate(name, phone, bookingDate);
    }

    @PostMapping("/buffer")
    public void addBuffer(@RequestBody Map<String, Object> request) {
        String dateStr = (String) request.get("date");
        LocalDate date = (dateStr != null) ? LocalDate.parse(dateStr) : LocalDate.now();
        int minutes = (int) request.get("minutes");
        queueService.addBufferMinutes(date, minutes);
    }

    @GetMapping("/availability")
    public Map<String, Object> getAvailability(@RequestParam("date") String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        return queueService.checkAvailability(date);
    }

    @PostMapping("/doctor-availability")
    public void setDoctorAvailability(@RequestBody Map<String, Object> request) {
        String dateStr = (String) request.get("date");
        LocalDate date = (dateStr != null) ? LocalDate.parse(dateStr) : LocalDate.now();
        boolean available = (boolean) request.get("available");
        queueService.setDoctorAvailability(date, available);
    }
}
