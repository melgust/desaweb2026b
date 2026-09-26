package com.example.catalog.catalog.repository;

import com.example.catalog.catalog.entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/**
 * Persistence access for {@link Product}. Contains only persistence
 * concerns.
 *
 * <p>Extends {@link ProductRepositoryCustom} so the service can request
 * dynamic filter queries (status / sku / search) without writing them
 * itself.</p>
 */
public interface ProductRepository
        extends MongoRepository<Product, String>, ProductRepositoryCustom {

    boolean existsBySku(String sku);

    boolean existsBySlug(String slug);

    Optional<Product> findBySku(String sku);

    Optional<Product> findBySlug(String slug);
}
