package com.macifuinaj.catalog.catalog.dto;

import com.macifuinaj.catalog.catalog.entity.ProductStatus;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Full product representation returned by single-resource endpoints.
 */
public record ProductResponse(
        String id,
        String sku,
        String name,
        String slug,
        String description,
        BigDecimal price,
        String currency,
        ProductStatus status,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {
}
