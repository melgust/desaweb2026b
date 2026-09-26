package com.example.catalog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Enables MongoDB auditing so {@code @CreatedDate}/{@code @LastModifiedDate}
 * on {@code Product} get populated automatically - the MongoDB equivalent of
 * Hibernate's {@code @CreationTimestamp}/{@code @UpdateTimestamp}.
 *
 * <p>Kept as its own {@code @Configuration} class (instead of annotating
 * {@code CatalogApplication} directly) so that {@code @WebMvcTest} slices,
 * which only need controller/web beans, correctly exclude it and don't try
 * to load Mongo-specific infrastructure.</p>
 */
@Configuration
@EnableMongoAuditing
public class MongoAuditingConfig {
}
