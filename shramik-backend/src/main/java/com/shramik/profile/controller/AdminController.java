package com.shramik.profile.controller;

import com.shramik.profile.model.PriceReport;
import com.shramik.profile.model.Technician;
import com.shramik.profile.model.User;
import com.shramik.profile.model.VerificationStatus;
import com.shramik.profile.repository.PriceReportRepository;
import com.shramik.profile.repository.TechnicianRepository;
import com.shramik.profile.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PriceReportRepository priceReportRepository;

    @GetMapping("/pending-audits")
    public ResponseEntity<?> getPendingAudits() {
        log.info("Fetching all pending technician verification profiles");
        List<Technician> pendingTechs = technicianRepository.findByVerificationStatus(VerificationStatus.PENDING);
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (Technician tech : pendingTechs) {
            Optional<User> userOpt = userRepository.findById(tech.getUserId());
            if (userOpt.isPresent()) {
                Map<String, Object> map = new HashMap<>();
                map.put("technician", tech);
                map.put("user", userOpt.get());
                response.add(map);
            }
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/approve/{techId}")
    public ResponseEntity<?> approveTechnician(@PathVariable String techId) {
        log.info("Approving technician profile ID: {}", techId);
        Optional<Technician> techOpt = technicianRepository.findById(techId);
        if (techOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Technician tech = techOpt.get();
        tech.setVerificationStatus(VerificationStatus.APPROVED);
        // By default, make them search-visible immediately if they were approved
        tech.setOnline(true); 
        technicianRepository.save(tech);
        
        return ResponseEntity.ok(Map.of("message", "Technician profile approved successfully."));
    }

    @PostMapping("/reject/{techId}")
    public ResponseEntity<?> rejectTechnician(@PathVariable String techId) {
        log.info("Rejecting technician profile ID: {}", techId);
        Optional<Technician> techOpt = technicianRepository.findById(techId);
        if (techOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Technician tech = techOpt.get();
        tech.setVerificationStatus(VerificationStatus.REJECTED);
        tech.setOnline(false);
        technicianRepository.save(tech);
        
        return ResponseEntity.ok(Map.of("message", "Technician profile rejected successfully."));
    }

    @GetMapping("/price-reports")
    public ResponseEntity<List<PriceReport>> getAllPriceReports() {
        log.info("Fetching global crowdsourced pricing ledgers");
        return ResponseEntity.ok(priceReportRepository.findAll());
    }

    @DeleteMapping("/price-reports/{id}")
    public ResponseEntity<?> deletePriceReport(@PathVariable String id) {
        log.info("Deleting anomalous price report record ID: {}", id);
        if (!priceReportRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        priceReportRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Anomalous price record removed successfully."));
    }
}
