package com.shramik.profile.controller;

import com.shramik.profile.dto.TechnicianSearchResponse;
import com.shramik.profile.model.Technician;
import com.shramik.profile.model.User;
import com.shramik.profile.repository.TechnicianRepository;
import com.shramik.profile.repository.UserRepository;
import com.shramik.profile.service.GeoSearchService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/technicians")
public class GeoController {

    @Autowired
    private GeoSearchService geoSearchService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @GetMapping("/search")
    public ResponseEntity<List<TechnicianSearchResponse>> searchTechnicians(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "5.0") double radiusKm,
            @RequestParam(required = false) String skill) {
        
        log.info("Searching technicians within {} km of [lng: {}, lat: {}] with skill: {}", radiusKm, lng, lat, skill);
        List<TechnicianSearchResponse> results = geoSearchService.searchTechnicians(lng, lat, radiusKm, skill);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<TechnicianSearchResponse>> searchNearbyTechnicians(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "5.0") double radiusKm,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String locality) {
        
        log.info("Searching nearby technicians within {} km of [lng: {}, lat: {}] with filters - skill: {}, priceRange: [{}, {}], locality: {}", 
                radiusKm, lng, lat, skill, minPrice, maxPrice, locality);
        
        List<TechnicianSearchResponse> results = geoSearchService.searchTechniciansWithFilters(lng, lat, radiusKm, skill, minPrice, maxPrice, locality);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        String email = principal.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        if (user.getRole() == com.shramik.profile.model.Role.TECHNICIAN) {
            Optional<Technician> techOpt = technicianRepository.findByUserId(user.getId());
            return ResponseEntity.ok(Map.of("user", user, "technician", techOpt.orElse(null)));
        }
        return ResponseEntity.ok(Map.of("user", user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> updates, Principal principal) {
        String email = principal.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (updates.containsKey("name")) {
            user.setName((String) updates.get("name"));
        }
        if (updates.containsKey("phone")) {
            user.setPhone((String) updates.get("phone"));
        }
        if (updates.containsKey("latitude") && updates.containsKey("longitude")) {
            double lat = Double.parseDouble(updates.get("latitude").toString());
            double lng = Double.parseDouble(updates.get("longitude").toString());
            GeoJsonPoint pt = new GeoJsonPoint(lng, lat);
            user.setLocation(pt);
            
            // Sync with technician location if profile is a technician
            if (user.getRole() == com.shramik.profile.model.Role.TECHNICIAN) {
                Optional<Technician> techOpt = technicianRepository.findByUserId(user.getId());
                if (techOpt.isPresent()) {
                    Technician tech = techOpt.get();
                    tech.setLocation(pt);
                    technicianRepository.save(tech);
                }
            }
        }
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/status")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<?> toggleOnlineStatus(@RequestBody Map<String, Boolean> statusUpdate, Principal principal) {
        String email = principal.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        Optional<Technician> techOpt = technicianRepository.findByUserId(user.getId());
        if (techOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Technician tech = techOpt.get();
        if (statusUpdate.containsKey("isOnline")) {
            tech.setOnline(statusUpdate.get("isOnline"));
            technicianRepository.save(tech);
            log.info("Technician online status changed to: {}", tech.isOnline());
        }
        
        return ResponseEntity.ok(tech);
    }

    @PutMapping("/skills")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<?> updateSkills(@RequestBody List<String> skills, Principal principal) {
        String email = principal.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        Optional<Technician> techOpt = technicianRepository.findByUserId(user.getId());
        if (techOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Technician tech = techOpt.get();
        tech.setSkills(skills);
        technicianRepository.save(tech);
        log.info("Updated skills for technician: {}", skills);
        
        return ResponseEntity.ok(tech);
    }
}
