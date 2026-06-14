package com.shramik.profile.repository;

import com.shramik.profile.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByCustomerId(String customerId);
    List<Booking> findByTechnicianId(String technicianId);
    List<Booking> findByStatus(String status);
}
