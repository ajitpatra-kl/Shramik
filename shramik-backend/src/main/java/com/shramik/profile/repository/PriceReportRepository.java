package com.shramik.profile.repository;

import com.shramik.profile.model.PriceReport;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PriceReportRepository extends MongoRepository<PriceReport, String> {
}
