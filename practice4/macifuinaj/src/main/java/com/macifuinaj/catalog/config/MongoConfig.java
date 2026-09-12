package com.macifuinaj.catalog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * MongoDB-specific configuration.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}