package com.shramik.profile.controller;

import com.shramik.profile.dto.JwtResponse;
import com.shramik.profile.dto.LoginResult;
import com.shramik.profile.dto.OtpRequest;
import com.shramik.profile.dto.OtpVerificationRequest;
import com.shramik.profile.dto.PasswordLoginRequest;
import com.shramik.profile.service.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Unified Sign-In / Sign-Up endpoint.
     *
     * EXISTING USER → password validated → HTTP 200 with full JwtResponse in body.
     *                 Frontend logs the user in immediately, no OTP needed.
     *
     * NEW USER      → account created → OTP sent to email → HTTP 202 with
     *                 { requiresOtp: true, email, message }.
     *                 Frontend shows the OTP entry screen.
     */
    @PostMapping("/login-request")
    public ResponseEntity<?> loginRequest(@Valid @RequestBody PasswordLoginRequest request) {
        log.info("Auth request for: {} | role: {}", request.getEmail(), request.getRole());

        LoginResult result = authService.loginRequest(request);

        if (result.isRequiresOtp()) {
            // New user — needs email verification
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "requiresOtp", true,
                "email",       result.getEmail(),
                "message",     result.getMessage()
            ));
        } else {
            // Existing user — signed in, return JWT directly
            return ResponseEntity.ok(Map.of(
                "requiresOtp",        false,
                "token",              result.getToken(),
                "email",              result.getEmail(),
                "userId",             result.getUserId(),
                "role",               result.getRole(),
                "profileComplete",    result.isProfileComplete(),
                "verificationStatus", result.getVerificationStatus() != null
                                        ? result.getVerificationStatus().name()
                                        : ""
            ));
        }
    }

    /**
     * OTP Verification — only called for NEW USER sign-up completion.
     * Not used for sign-in (existing users get their JWT from /login-request directly).
     */
    @PostMapping("/otp/verify")
    public ResponseEntity<JwtResponse> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        log.info("OTP verification for new user: {}", request.getEmail());
        JwtResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Legacy OTP-only endpoint — kept for backward compatibility.
     */
    @PostMapping("/otp/request")
    public ResponseEntity<?> requestOtp(@Valid @RequestBody OtpRequest request) {
        log.info("Legacy OTP request for: {}", request.getEmail());
        authService.requestOtp(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully."));
    }
}
