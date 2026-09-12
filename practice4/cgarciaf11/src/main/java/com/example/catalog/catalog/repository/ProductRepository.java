package com.example.catalog.catalog.repository;

import com.example.catalog.catalog.entity.Product;
import com.example.catalog.catalog.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends MongoRepository<Product, UUID> {

    boolean existsBySku(String sku);

    boolean existsBySlug(String slug);

    Optional<Product> findBySlug(String slug);

    // Búsqueda paginada con filtros opcionales para MongoDB
    @Query("{ " +
           "?0 == null OR status == ?0 }, " +
           "?1 == null OR sku == ?1 }, " +
           "?2 == null OR name == { $regex: ?2, $options: 'i' } OR description == { $regex: ?2, $options: 'i' } " +
           "}")
    Page<Product> findByFilters(ProductStatus status, String sku, String search, Pageable pageable);
}