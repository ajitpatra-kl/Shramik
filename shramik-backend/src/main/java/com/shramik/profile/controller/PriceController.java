package com.shramik.profile.controller;

import com.shramik.profile.dto.PriceReportRequest;
import com.shramik.profile.dto.ReviewRequest;
import com.shramik.profile.model.PriceReport;
import com.shramik.profile.model.Technician;
import com.shramik.profile.repository.PriceReportRepository;
import com.shramik.profile.repository.TechnicianRepository;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.NearQuery;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/price-reports")
public class PriceController {

    @Autowired
    private PriceReportRepository priceReportRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @PostMapping("/submit")
    public ResponseEntity<?> submitPriceReport(@RequestBody PriceReportRequest request, Principal principal) {
        log.info("Submitting price report for skill [{}]: Amount ₹{}", request.getServiceType(), request.getPricePaid());
        
        GeoJsonPoint pt = null;
        if (request.getLongitude() != null && request.getLatitude() != null) {
            pt = new GeoJsonPoint(request.getLongitude(), request.getLatitude());
        }

        PriceReport report = PriceReport.builder()
                .userId(principal.getName())
                .serviceType(request.getServiceType())
                .pricePaid(request.getPricePaid())
                .location(pt)
                .reportedAt(LocalDateTime.now())
                .build();

        priceReportRepository.save(report);
        return ResponseEntity.ok(Map.of("message", "Price reported successfully", "data", report));
    }

    @GetMapping("/average")
    public ResponseEntity<?> getAveragePrice(
            @RequestParam String serviceType,
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "10.0") double radiusKm) {
        
        log.info("Calculating average local price index for [{}] within {} km of [lng: {}, lat: {}]", serviceType, radiusKm, lng, lat);
        
        Point point = new Point(lng, lat);
        NearQuery nearQuery = NearQuery.near(point)
                .maxDistance(new Distance(radiusKm, Metrics.KILOMETERS))
                .spherical(true);

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.geoNear(nearQuery, "distanceKm"),
                Aggregation.match(Criteria.where("serviceType").is(serviceType)),
                Aggregation.group("serviceType")
                        .avg("pricePaid").as("avgPrice")
                        .count().as("count")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(agg, "price_reports", Document.class);
        List<Document> mappedResults = results.getMappedResults();

        if (mappedResults.isEmpty()) {
            // Default market price fallbacks if no crowdsourced ledger exists yet
            double fallback = switch (serviceType.toLowerCase()) {
                case "electrician" -> 350.0;
                case "plumber" -> 400.0;
                case "carpenter" -> 450.0;
                case "painter" -> 600.0;
                default -> 300.0;
            };
            return ResponseEntity.ok(Map.of("avgPrice", fallback, "count", 0, "isFallback", true));
        }

        Document doc = mappedResults.get(0);
        double avg = doc.getDouble("avgPrice");
        int count = doc.getInteger("count");

        return ResponseEntity.ok(Map.of(
                "avgPrice", Math.round(avg * 100.0) / 100.0,
                "count", count,
                "isFallback", false
        ));
    }

    // Submit review & log invoice
    @PostMapping("/review")
    public ResponseEntity<?> submitReview(@RequestBody ReviewRequest request, Principal principal) {
        log.info("Submitting review for technician [{}]: Rating {}", request.getTechnicianId(), request.getRating());
        
        Optional<Technician> techOpt = technicianRepository.findById(request.getTechnicianId());
        if (techOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Technician tech = techOpt.get();
        
        // Update ratings
        double currentTotalStars = tech.getAvgRating() * tech.getTotalJobs();
        int newTotalJobs = tech.getTotalJobs() + 1;
        double newAvgRating = (currentTotalStars + request.getRating()) / newTotalJobs;
        
        tech.setTotalJobs(newTotalJobs);
        tech.setAvgRating(Math.round(newAvgRating * 10.0) / 10.0);
        technicianRepository.save(tech);

        // Record a PriceReport as well (since a transaction occurred)
        if (request.getAmountPaid() > 0 && !tech.getSkills().isEmpty() && tech.getLocation() != null) {
            PriceReport report = PriceReport.builder()
                    .userId(principal.getName())
                    .serviceType(tech.getSkills().get(0)) // Use primary skill
                    .pricePaid(request.getAmountPaid())
                    .location(tech.getLocation())
                    .reportedAt(LocalDateTime.now())
                    .build();
            priceReportRepository.save(report);
            log.info("Automatically logged price report of ₹{} from job review", request.getAmountPaid());
        }

        return ResponseEntity.ok(Map.of("message", "Review and invoice logged successfully", "avgRating", tech.getAvgRating()));
    }
}
