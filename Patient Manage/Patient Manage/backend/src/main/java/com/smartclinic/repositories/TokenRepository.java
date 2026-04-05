package com.smartclinic.repositories;

import com.smartclinic.models.Token;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TokenRepository extends MongoRepository<Token, String> {
    Optional<Token> findFirstByOrderByTokenNumberDesc();
    List<Token> findByStatus(Token.Status status);
    Optional<Token> findFirstByStatusOrderByTokenNumberAsc(Token.Status status);
    List<Token> findByOrderByTokenNumberAsc();
    
    // Date-based methods
    Optional<Token> findFirstByBookingDateOrderByTokenNumberDesc(LocalDate date);
    List<Token> findByBookingDateOrderByTokenNumberAsc(LocalDate date);
    Optional<Token> findFirstByBookingDateAndStatusOrderByTokenNumberAsc(LocalDate date, Token.Status status);
    List<Token> findByBookingDateAndStatus(LocalDate date, Token.Status status);
    Optional<Token> findTopByPatientNameAndPhoneNumberOrderByCreatedAtDesc(String name, String phone);
    Optional<Token> findTopByPatientNameAndPhoneNumberAndBookingDateOrderByCreatedAtDesc(String name, String phone, LocalDate bookingDate);
}
