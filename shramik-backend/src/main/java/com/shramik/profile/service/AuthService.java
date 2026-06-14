package com.shramik.profile.service;

import com.shramik.profile.dto.JwtResponse;
import com.shramik.profile.dto.LoginResult;
import com.shramik.profile.dto.OtpVerificationRequest;
import com.shramik.profile.dto.PasswordLoginRequest;
import com.shramik.profile.model.OtpToken;
import com.shramik.profile.model.Role;
import com.shramik.profile.model.Technician;
import com.shramik.profile.model.User;
import com.shramik.profile.model.VerificationStatus;
import com.shramik.profile.repository.OtpTokenRepository;
import com.shramik.profile.repository.TechnicianRepository;
import com.shramik.profile.repository.UserRepository;
import com.shramik.profile.security.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Date;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
public class AuthService {

    @Autowired private OtpTokenRepository otpTokenRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TechnicianRepository technicianRepository;
    @Autowired private EmailService emailService;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private PasswordEncoder passwordEncoder;

    // ─────────────────────────────────────────────────────────────────────────
    // SIGN IN / SIGN UP — Step 1
    //
    // EXISTING USER  → validate password → issue JWT immediately (no OTP).
    // NEW USER       → create account   → send OTP to email for verification.
    // ─────────────────────────────────────────────────────────────────────────
    public LoginResult loginRequest(PasswordLoginRequest request) {
        String email    = request.getEmail();
        String rawPass  = request.getPassword();

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            // ── EXISTING USER: Password sign-in ──────────────────────────────
            User user = userOpt.get();

            if (user.getPassword() == null) {
                // Migrated from OTP-only flow — first time setting a password.
                user.setPassword(passwordEncoder.encode(rawPass));
                userRepository.save(user);
                log.info("Password set for migrated user: {}", email);
            } else if (!passwordEncoder.matches(rawPass, user.getPassword())) {
                throw new BadCredentialsException("Incorrect password. Please try again.");
            }

            // Password OK — issue JWT directly, no OTP needed.
            log.info("Sign-in successful for existing user: {}", email);
            return buildSignInResult(user);

        } else {
            // ── NEW USER: Registration + email OTP verification ──────────────
            Role assignedRole = request.getRole() != null ? request.getRole() : Role.USER;

            GeoJsonPoint point = null;
            if (request.getLongitude() != null && request.getLatitude() != null) {
                point = new GeoJsonPoint(request.getLongitude(), request.getLatitude());
            }

            User newUser = User.builder()
                    .email(email)
                    .name(email.split("@")[0])
                    .phone("")
                    .role(assignedRole)
                    .password(passwordEncoder.encode(rawPass))
                    .location(point)
                    .build();
            newUser = userRepository.save(newUser);

            // Auto-create technician sub-profile if needed.
            if (assignedRole == Role.TECHNICIAN) {
                GeoJsonPoint finalPoint = point;
                Technician tech = Technician.builder()
                        .userId(newUser.getId())
                        .location(finalPoint)
                        .skills(Collections.emptyList())
                        .verificationStatus(VerificationStatus.NOT_SUBMITTED)
                        .isOnline(false)
                        .avgRating(0.0)
                        .totalJobs(0)
                        .build();
                technicianRepository.save(tech);
            }

            log.info("New user registered: {} ({}). Sending OTP for email verification.", email, assignedRole);
            sendOtpToEmail(email);

            return LoginResult.builder()
                    .requiresOtp(true)
                    .email(email)
                    .message("Account created! A 6-digit verification code has been sent to " + email + ". Please check your inbox.")
                    .build();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VERIFY OTP — Step 2 (only for new registrations)
    //
    // Validates the OTP from email, then issues JWT to complete sign-up.
    // ─────────────────────────────────────────────────────────────────────────
    public JwtResponse verifyOtp(OtpVerificationRequest request) {
        String email = request.getEmail();
        String code  = request.getOtpCode();

        OtpToken otpToken = otpTokenRepository.findByEmailAndOtpCode(email, code)
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired verification code."));

        otpTokenRepository.delete(otpToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Account not found. Please restart sign-up."));

        // Update location on verification if provided.
        if (request.getLongitude() != null && request.getLatitude() != null) {
            GeoJsonPoint point = new GeoJsonPoint(request.getLongitude(), request.getLatitude());
            user.setLocation(point);
            userRepository.save(user);

            if (user.getRole() == Role.TECHNICIAN) {
                technicianRepository.findByUserId(user.getId()).ifPresent(tech -> {
                    tech.setLocation(point);
                    technicianRepository.save(tech);
                });
            }
        }

        log.info("Email verification complete for new user: {}", email);
        return buildJwtResponse(user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Legacy OTP-only request (kept for backward compat, not used in new flow)
    // ─────────────────────────────────────────────────────────────────────────
    public void requestOtp(String email) {
        sendOtpToEmail(email);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /** Builds a LoginResult with a JWT for direct sign-in (no OTP required). */
    private LoginResult buildSignInResult(User user) {
        JwtResponse jwt = buildJwtResponse(user);
        return LoginResult.builder()
                .requiresOtp(false)
                .token(jwt.getToken())
                .email(jwt.getEmail())
                .userId(jwt.getUserId())
                .role(jwt.getRole())
                .profileComplete(jwt.isProfileComplete())
                .verificationStatus(jwt.getVerificationStatus())
                .build();
    }

    /** Builds the JWT response for a verified user. */
    private JwtResponse buildJwtResponse(User user) {
        boolean profileComplete = user.getName() != null && !user.getName().isBlank()
                && user.getPhone() != null && !user.getPhone().isBlank()
                && user.getLocation() != null;

        VerificationStatus verificationStatus = null;
        if (user.getRole() == Role.TECHNICIAN) {
            verificationStatus = technicianRepository.findByUserId(user.getId())
                    .map(Technician::getVerificationStatus)
                    .orElse(null);
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getId(), user.getRole().name());

        return JwtResponse.builder()
                .token(token)
                .email(user.getEmail())
                .userId(user.getId())
                .role(user.getRole().name())
                .profileComplete(profileComplete)
                .verificationStatus(verificationStatus)
                .build();
    }

    /** Generates a 6-digit OTP, saves it to MongoDB, and dispatches the email. */
    private void sendOtpToEmail(String email) {
        String otpCode = String.format("%06d", new Random().nextInt(1_000_000));

        // Remove any existing OTP for this email to prevent duplicates.
        otpTokenRepository.findByEmail(email).ifPresent(otpTokenRepository::delete);

        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otpCode(otpCode)
                .createdAt(new Date())
                .build();
        otpTokenRepository.save(otpToken);

        emailService.sendOtpEmail(email, otpCode);
        log.info("Verification OTP dispatched to: {}", email);
    }
}
