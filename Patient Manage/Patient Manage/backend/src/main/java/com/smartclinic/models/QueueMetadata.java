package com.smartclinic.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@Document(collection = "queue_metadata")
public class QueueMetadata {
    @Id
    private String id;
    private LocalDate date;
    private int bufferMinutes;
    private boolean doctorAvailable = true;
}
