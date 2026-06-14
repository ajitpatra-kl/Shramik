package com.shramik.profile.repository;

import com.shramik.profile.model.OtpToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface OtpTokenRepository extends MongoRepository<OtpToken, String> {
    Optional<OtpToken> findFirstByEmailOrderByCreatedAtDesc(String email);
    Optional<OtpToken> findByEmailAndOtpCode(String email, String otpCode);
    Optional<OtpToken> findByEmail(String email);
}
