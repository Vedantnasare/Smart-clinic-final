package com.smartclinic.repositories;

import com.smartclinic.models.QueueMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface QueueMetadataRepository extends MongoRepository<QueueMetadata, String> {
    Optional<QueueMetadata> findByDate(LocalDate date);
}
