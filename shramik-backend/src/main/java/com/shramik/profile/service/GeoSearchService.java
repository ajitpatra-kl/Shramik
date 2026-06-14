package com.shramik.profile.service;

import com.shramik.profile.dto.TechnicianSearchResponse;
import com.shramik.profile.model.Technician;
import com.shramik.profile.model.User;
import com.shramik.profile.model.VerificationStatus;
import com.shramik.profile.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResult;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.NearQuery;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GeoSearchService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private UserRepository userRepository;

    public List<TechnicianSearchResponse> searchTechnicians(double longitude, double latitude, double radiusInKm, String skill) {
        return searchTechniciansWithFilters(longitude, latitude, radiusInKm, skill, null, null, null);
    }

    public List<TechnicianSearchResponse> searchTechniciansWithFilters(double longitude, double latitude, double radiusInKm, 
                                                                       String skill, Double minPrice, Double maxPrice, String locality) {
        Point point = new Point(longitude, latitude);
        
        // 1. Configure geospatial proximity limits (in kilometers)
        NearQuery nearQuery = NearQuery.near(point)
                .maxDistance(new Distance(radiusInKm, Metrics.KILOMETERS))
                .spherical(true);
        
        // 2. Add filtering criteria: online status and administrative approval
        Query query = new Query();
        Criteria criteria = Criteria.where("isOnline").is(true)
                .and("verificationStatus").is(VerificationStatus.APPROVED);
        
        if (skill != null && !skill.trim().isEmpty()) {
            criteria.and("skills").in(skill);
        }
        
        // 3. Add price filtering
        if (minPrice != null || maxPrice != null) {
            if (minPrice != null && maxPrice != null) {
                criteria.and("pricePerHour").gte(minPrice).lte(maxPrice);
            } else if (minPrice != null) {
                criteria.and("pricePerHour").gte(minPrice);
            } else {
                criteria.and("pricePerHour").lte(maxPrice);
            }
        }
        
        // 4. Add locality filtering (searching in user name or skill or other locality-related fields)
        if (locality != null && !locality.trim().isEmpty()) {
            // This would require joining with User collection; for now, we filter in post-processing
        }
        
        query.addCriteria(criteria);
        nearQuery.query(query);
        
        // 5. Execute geospatial search
        GeoResults<Technician> results = mongoTemplate.geoNear(nearQuery, Technician.class);
        
        List<GeoResult<Technician>> content = results.getContent();
        if (content.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 6. Retrieve technician user profiles in a single bulk query
        Set<String> userIds = content.stream()
                .map(r -> r.getContent().getUserId())
                .collect(Collectors.toSet());
                
        List<User> users = userRepository.findAllById(userIds);
        Map<String, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, u -> u));
                
        // 7. Assemble response list maintaining geo-proximity sorted order
        List<TechnicianSearchResponse> response = new ArrayList<>();
        for (GeoResult<Technician> result : content) {
            Technician tech = result.getContent();
            User user = userMap.get(tech.getUserId());
            if (user != null) {
                // Apply locality filter after user lookup
                if (locality != null && !locality.trim().isEmpty()) {
                    if (!user.getName().toLowerCase().contains(locality.toLowerCase())) {
                        continue; // Skip if locality doesn't match
                    }
                }
                
                // GeoResult.getDistance() represents distance in the metric used, here KILOMETERS
                double distanceVal = result.getDistance().getValue();
                response.add(TechnicianSearchResponse.builder()
                        .technician(tech)
                        .user(user)
                        .distanceInKm(Math.round(distanceVal * 100.0) / 100.0) // round to 2 decimals
                        .build());
            }
        }
        
        return response;
    }
}
