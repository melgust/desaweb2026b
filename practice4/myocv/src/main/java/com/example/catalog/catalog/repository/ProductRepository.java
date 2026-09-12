package com.example.catalog.catalog.repository;

import com.example.catalog.catalog.entity.Product;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.example.catalog.catalog.entity.ProductStatus;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Persistence access for {@link Product}. Contains only persistence concerns.
 *
 * <p>Extends {@link JpaSpecificationExecutor} so the service can build dynamic
 * filter queries (status / sku / search) without writing SQL.</p>
 */
public interface ProductRepository
        extends MongoRepository<Product, UUID> {

    boolean existsBySku(String sku);

    boolean existsBySlug(String slug);

    Optional<Product> findBySku(String sku);

    Optional<Product> findBySlug(String slug);


    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Product> findByDescriptionContainingIgnoreCase(String description, Pageable pageable);
}
