package com.smartclinic.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class WhatsAppService {

    @Value("${whatsapp.api.token:}")
    private String apiToken;

    @Value("${whatsapp.phone.number.id:}")
    private String phoneNumberId;

    private final String GRAPH_API_URL = "https://graph.facebook.com/v18.0/%s/messages";

    public boolean sendMessage(String to, String message) {
        if (apiToken == null || apiToken.isEmpty() || phoneNumberId == null || phoneNumberId.isEmpty()) {
            System.err.println("WhatsApp API credentials missing. Falling back to redirect mode.");
            return false;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = String.format(GRAPH_API_URL, phoneNumberId);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Using "text" message type
            Map<String, Object> body = new HashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("recipient_type", "individual");
            body.put("to", to.replace("+", "").replace(" ", ""));
            body.put("type", "text");
            
            Map<String, String> text = new HashMap<>();
            text.put("body", message);
            body.put("text", text);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            System.err.println("Error sending WhatsApp message: " + e.getMessage());
            return false;
        }
    }
}
