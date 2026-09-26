package com.example.catalog.catalog.repository;

import com.example.catalog.catalog.entity.Product;
import com.example.catalog.catalog.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Dynamic, filterable persistence queries that plain derived query methods
 * cannot express. Implemented with {@code MongoTemplate} in
 * {@link ProductRepositoryImpl}, the MongoDB equivalent of the JPA
 * {@code Specification} approach.
 */
public interface ProductRepositoryCustom {

    Page<Product> findAll(ProductStatus status, String sku, String search, Pageable pageable);
}
