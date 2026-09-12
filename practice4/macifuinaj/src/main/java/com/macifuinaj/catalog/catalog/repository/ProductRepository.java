package com.macifuinaj.catalog.catalog.repository;

import com.macifuinaj.catalog.catalog.entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/**
 * Persistence access for Product using MongoDB.
 */
public interface ProductRepository extends MongoRepository<Product, String> {

    boolean existsBySku(String sku);

    boolean existsBySlug(String slug);

    Optional<Product> findBySku(String sku);

    Optional<Product> findBySlug(String slug);
}