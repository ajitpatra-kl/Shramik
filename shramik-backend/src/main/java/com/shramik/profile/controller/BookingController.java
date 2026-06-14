package com.shramik.profile.controller;

import com.shramik.profile.model.Booking;
import com.shramik.profile.model.User;
import com.shramik.profile.repository.BookingRepository;
import com.shramik.profile.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/bookings
     * Create a new booking request from authenticated customer
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> bookingData, Principal principal) {
        try {
            String email = principal.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not found"));
            }

            User customer = userOpt.get();
            String technicianId = (String) bookingData.get("technicianId");
            String description = (String) bookingData.get("description");
            Object dateObj = bookingData.get("requestedDate");
            
            if (technicianId == null || technicianId.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "technicianId is required"));
            }
            
            if (description == null || description.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "description is required"));
            }

            LocalDateTime requestedDate = LocalDateTime.now();
            if (dateObj != null) {
                try {
                    // Try parsing ISO 8601 format
                    requestedDate = LocalDateTime.parse(dateObj.toString());
                } catch (Exception e) {
                    log.warn("Failed to parse requestedDate: {}", dateObj);
                }
            }

            Booking booking = Booking.builder()
                    .customerId(customer.getId())
                    .technicianId(technicianId)
                    .requestedDate(requestedDate)
                    .description(description)
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            Booking savedBooking = bookingRepository.save(booking);
            log.info("Booking created: {} by customer: {}", savedBooking.getId(), customer.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "id", savedBooking.getId(),
                    "status", savedBooking.getStatus(),
                    "message", "Booking request submitted successfully"
            ));
        } catch (Exception e) {
            log.error("Error creating booking", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create booking: " + e.getMessage()));
        }
    }

    /**
     * GET /api/bookings
     * Retrieve all bookings for authenticated user (customer or technician)
     */
    @GetMapping
    public ResponseEntity<?> getBookings(Principal principal) {
        try {
            String email = principal.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            List<Booking> bookings;

            if (user.getRole().toString().equals("CUSTOMER")) {
                bookings = bookingRepository.findByCustomerId(user.getId());
            } else if (user.getRole().toString().equals("TECHNICIAN")) {
                bookings = bookingRepository.findByTechnicianId(user.getId());
            } else {
                bookings = List.of();
            }

            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            log.error("Error fetching bookings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch bookings"));
        }
    }

    /**
     * GET /api/bookings/{id}
     * Retrieve a specific booking by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(@PathVariable String id) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(bookingOpt.get());
    }

    /**
     * PUT /api/bookings/{id}/status
     * Update booking status (for technician to accept/reject)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<?> updateBookingStatus(@PathVariable String id, 
                                                  @RequestBody Map<String, String> statusUpdate) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Booking booking = bookingOpt.get();
            String newStatus = statusUpdate.get("status");
            
            if (newStatus != null && !newStatus.isEmpty()) {
                booking.setStatus(newStatus);
                booking.setUpdatedAt(LocalDateTime.now());
                bookingRepository.save(booking);
                log.info("Booking {} status updated to: {}", id, newStatus);
            }

            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            log.error("Error updating booking status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update booking status"));
        }
    }
}
