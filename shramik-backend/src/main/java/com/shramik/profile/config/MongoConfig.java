package com.shramik.profile.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

import java.util.Collections;

/**
 * MongoDB configuration to:
 * 1. Suppress the '_class' type field from all documents (cleaner documents, smaller storage)
 * 2. Register custom type conversions if needed (extendable)
 * 3. Provide transaction manager for multi-document ACID operations
 *
 * GeoJSON indexes (2dsphere) are declared via @GeoSpatialIndexed annotations on domain models.
 * TTL index on OtpToken.createdAt is declared via @Indexed(expireAfterSeconds = 300).
 * Both require Spring Data MongoDB to initialize the index at startup, which it does automatically.
 */
@Configuration
public class MongoConfig {

    /**
     * Remove the '_class' discriminator field from persisted MongoDB documents.
     * Spring Data MongoDB adds this by default for polymorphism support, but since
     * we use concrete domain classes without inheritance, it's unnecessary overhead.
     */
    @Bean
    public MongoTemplate mongoTemplate(
            MongoDatabaseFactory databaseFactory,
            MappingMongoConverter converter) {

        // Suppress the _class field written to each document
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return new MongoTemplate(databaseFactory, converter);
    }

    /**
     * Custom type conversions registry — extend this to add custom converters
     * for domain-specific types (e.g., custom enum mapping, value types).
     */
    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(Collections.emptyList());
    }

    /**
     * Transaction Manager — required if you plan to use @Transactional on
     * multi-document MongoDB operations (requires a MongoDB replica set).
     * Provided here for completeness; can be activated when replica set is configured.
     */
    @Bean
    public MongoTransactionManager transactionManager(MongoDatabaseFactory databaseFactory) {
        return new MongoTransactionManager(databaseFactory);
    }
}
