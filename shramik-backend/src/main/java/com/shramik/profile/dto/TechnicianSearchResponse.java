package com.shramik.profile.dto;

import com.shramik.profile.model.Technician;
import com.shramik.profile.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianSearchResponse {
    private Technician technician;
    private User user;
    private double distanceInKm;
}
