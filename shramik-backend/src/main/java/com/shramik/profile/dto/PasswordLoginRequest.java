package com.shramik.profile.dto;

import com.shramik.profile.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * PasswordLoginRequest — Step 1 of the Gmail + Password + OTP auth flow.
 *
 * The user submits their Gmail address, a password, and their desired role.
 * The backend validates/creates the account and sends an OTP to the Gmail address.
 * After this call succeeds, the client moves to the OTP verification step.
 */
@Data
public class PasswordLoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid Gmail address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // USER (customer) or TECHNICIAN (worker)
    private Role role;

    // Optional GPS coordinates captured on the frontend
    private Double latitude;
    private Double longitude;
}
