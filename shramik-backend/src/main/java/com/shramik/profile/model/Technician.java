package com.shramik.profile.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "technicians")
public class Technician {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String userId;
    
    @Builder.Default
    private List<String> skills = new ArrayList<>();
    
    private String videoIntroUrl;
    
    private String idDocumentUrl;
    
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.NOT_SUBMITTED;
    
    @JsonProperty("isOnline")
    private boolean isOnline;
    
    private double avgRating;
    
    private int totalJobs;
    
    private double pricePerHour;
    
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;
}
