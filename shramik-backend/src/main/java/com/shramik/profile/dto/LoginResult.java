package com.shramik.profile.dto;

import com.shramik.profile.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * LoginResult — Returned by AuthService.loginRequest().
 *
 * Two possible outcomes:
 *   requiresOtp = false → Existing user, password verified, JwtResponse is populated.
 *                         The controller returns HTTP 200 with the token directly.
 *
 *   requiresOtp = true  → New user registration, OTP sent to email.
 *                         The controller returns HTTP 202, frontend shows OTP entry.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResult {

    /** True when this is a new-user sign-up and email OTP verification is required. */
    private boolean requiresOtp;

    private String message;
    private String email;

    // ── Populated only when requiresOtp = false (sign-in success) ─────────
    private String token;
    private String userId;
    private String role;
    private boolean profileComplete;
    private VerificationStatus verificationStatus;
}
