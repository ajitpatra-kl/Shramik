package com.shramik.profile.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

/**
 * OTP Token document with a MongoDB TTL index on 'createdAt'.
 * MongoDB's TTL index requires a BSON Date type (java.util.Date),
 * NOT LocalDateTime (which is stored as a string and NOT indexed by TTL).
 * The token expires exactly 300 seconds (5 minutes) after creation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "otp_tokens")
public class OtpToken {
    @Id
    private String id;

    @Indexed
    private String email;

    private String otpCode;

    /**
     * TTL index — MongoDB automatically deletes this document 300 seconds
     * after the 'createdAt' Date field value. MUST be java.util.Date for
     * the TTL index to function; LocalDateTime would be serialized as a
     * string and the TTL would silently never fire.
     */
    @Builder.Default
    @Indexed(expireAfterSeconds = 300)
    private Date createdAt = new Date();
}
