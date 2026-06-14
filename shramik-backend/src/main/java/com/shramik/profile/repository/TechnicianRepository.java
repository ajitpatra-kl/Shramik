package com.shramik.profile.repository;

import com.shramik.profile.model.Technician;
import com.shramik.profile.model.VerificationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface TechnicianRepository extends MongoRepository<Technician, String> {
    Optional<Technician> findByUserId(String userId);
    List<Technician> findByVerificationStatus(VerificationStatus status);
}
