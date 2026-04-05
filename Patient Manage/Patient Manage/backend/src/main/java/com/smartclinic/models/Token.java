package com.smartclinic.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tokens")
public class Token {
    @Id
    private String id;
    private String patientName;
    private String phoneNumber;
    private int tokenNumber;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime calledAt;
    private LocalDateTime completedAt;
    private LocalDate bookingDate;
    
    private String smartMessage;
    private boolean notificationSent;
    
    private boolean emergency;
    private String emergencyReason;
    private String slot; // MORNING, AFTERNOON, EVENING
    private LocalDateTime estimatedArrival;

    public enum Status {
        WAITING, CALLED, COMPLETED, CANCELLED
    }
}
