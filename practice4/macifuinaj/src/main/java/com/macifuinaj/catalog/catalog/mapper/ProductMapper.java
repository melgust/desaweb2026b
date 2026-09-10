package com.macifuinaj.catalog.catalog.mapper;

import com.macifuinaj.catalog.catalog.dto.ProductRequest;
import com.macifuinaj.catalog.catalog.dto.ProductResponse;
import com.macifuinaj.catalog.catalog.dto.ProductSummaryResponse;
import com.macifuinaj.catalog.catalog.entity.Product;
import org.springframework.stereotype.Component;

/**
 * Explicit conversions between {@link Product} entities and DTOs.
 * Mapping logic lives here, never in controllers.
 */
@Component
public class ProductMapper {

    /** Build a new entity from a create request. */
    public Product toEntity(ProductRequest request) {
        Product product = new Product();
        applyRequest(product, request);
        return product;
    }

    /** Copy mutable fields from a request onto an existing entity (update). */
    public void applyRequest(Product product, ProductRequest request) {
        product.setSku(request.sku());
        product.setName(request.name());
        product.setSlug(request.slug());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCurrency(request.currency());
        product.setStatus(request.status());
    }

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getCurrency(),
                product.getStatus(),
                product.getCreatedAt(),
                product.getUpdatedAt(),
                product.getVersion()
        );
    }

    public ProductSummaryResponse toSummaryResponse(Product product) {
        return new ProductSummaryResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getSlug(),
                product.getPrice(),
                product.getCurrency(),
                product.getStatus()
        );
    }
}
