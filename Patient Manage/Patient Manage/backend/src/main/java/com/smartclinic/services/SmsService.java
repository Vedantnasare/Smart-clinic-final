package com.smartclinic.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SmsService {

    @Value("${sms.api.key:}")
    private String apiKey;

    private final String FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

    public boolean sendSms(String phoneNumber, String message) {
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("SMS API Key missing. Please configure 'sms.api.key' in application.properties.");
            return false;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("authorization", apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("route", "q"); // Quick SMS route
            body.put("message", message);
            body.put("language", "english");
            body.put("numbers", phoneNumber.replace("+", "").replace(" ", ""));

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(FAST2SMS_URL, entity, (Class<Map<String, Object>>)(Class)Map.class);

            System.out.println("SMS API Response Status: " + response.getStatusCode());
            System.out.println("SMS API Response Body: " + response.getBody());

            return response.getStatusCode() == HttpStatus.OK;
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("SMS API Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("Error sending SMS: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }
}
