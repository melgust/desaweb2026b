package com.example.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Entry point for the Catalog microservice.
 *
 * <p>Current stage: no authentication and no API Gateway.
 * The service is directly reachable and uses MongoDB as its datastore.</p>
 */
@SpringBootApplication
@EnableMongoAuditing
public class CatalogApplication {

    public static void main(String[] args) {
        SpringApplication.run(CatalogApplication.class, args);
    }
}