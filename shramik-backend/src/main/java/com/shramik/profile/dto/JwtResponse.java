package com.shramik.profile.dto;

import com.shramik.profile.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String email;
    private String userId;
    private String role;
    private boolean profileComplete;
    private VerificationStatus verificationStatus; // for technician
}
