package com.example.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Catalog microservice.
 *
 * <p>Current stage: no authentication and no API Gateway. The service is
 * directly reachable and talks straight to MongoDB.</p>
 *
 * <p>MongoDB auditing ({@code @CreatedDate}/{@code @LastModifiedDate}) is
 * enabled in {@link com.example.catalog.config.MongoAuditingConfig} rather
 * than here, so that {@code @WebMvcTest} slices (which use this class only
 * as a context marker) don't try to load Mongo-specific auditing
 * infrastructure they don't need.</p>
 */
@SpringBootApplication
public class CatalogApplication {

    public static void main(String[] args) {
        SpringApplication.run(CatalogApplication.class, args);
    }
}
