package com.shramik.profile.dto;

import com.shramik.profile.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerificationRequest {
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    private String otpCode;
    
    // Optional, for first-time registration
    private String name;
    private String phone;
    private Role role;
    private Double latitude;
    private Double longitude;
}
