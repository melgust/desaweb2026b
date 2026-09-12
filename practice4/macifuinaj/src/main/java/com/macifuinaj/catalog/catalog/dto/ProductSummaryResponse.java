package com.macifuinaj.catalog.catalog.dto;

import com.macifuinaj.catalog.catalog.entity.ProductStatus;

import java.math.BigDecimal;

/**
 * Compact product representation used in paginated list responses.
 */
public record ProductSummaryResponse(
        String id,
        String sku,
        String name,
        String slug,
        BigDecimal price,
        String currency,
        ProductStatus status
) {
}
