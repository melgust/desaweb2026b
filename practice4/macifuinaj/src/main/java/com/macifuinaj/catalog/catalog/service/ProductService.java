package com.macifuinaj.catalog.catalog.service;

import com.macifuinaj.catalog.catalog.dto.ProductRequest;
import com.macifuinaj.catalog.catalog.dto.ProductResponse;
import com.macifuinaj.catalog.catalog.dto.ProductSummaryResponse;
import com.macifuinaj.catalog.catalog.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Business operations for the product catalog.
 */
public interface ProductService {

    ProductResponse create(ProductRequest request);

    ProductResponse getById(String id);

    Page<ProductSummaryResponse> findAll(
            ProductStatus status,
            String sku,
            String search,
            Pageable pageable);

    ProductResponse update(String id, ProductRequest request);

    void delete(String id);
}