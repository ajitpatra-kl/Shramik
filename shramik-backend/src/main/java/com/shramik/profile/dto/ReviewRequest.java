package com.shramik.profile.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotBlank
    private String technicianId;
    
    @Min(1)
    @Max(5)
    private int rating;
    
    private double amountPaid;
    
    private String comments;
}
