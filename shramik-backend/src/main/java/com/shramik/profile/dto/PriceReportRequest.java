package com.shramik.profile.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PriceReportRequest {
    @NotBlank
    private String serviceType;
    
    @Min(1)
    private double pricePaid;
    
    private Double latitude;
    private Double longitude;
}
