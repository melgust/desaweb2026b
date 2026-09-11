package com.example.catalog.catalog.repository;

import com.example.catalog.catalog.entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Acceso a persistencia de {@link Product}. Solo contiene aspectos de persistencia.
 *
 * <p>Sustituye a {@code JpaRepository}. Las consultas derivadas del nombre del
 * metodo funcionan igual que con JPA: Spring Data las traduce a filtros de
 * MongoDB en lugar de a SQL.</p>
 *
 * <p>{@code JpaSpecificationExecutor} no tiene equivalente en MongoDB, asi que el
 * filtrado dinamico se resuelve con el fragmento {@link ProductRepositoryCustom},
 * implementado con {@code MongoTemplate} y {@code Criteria}.</p>
 */
public interface ProductRepository
        extends MongoRepository<Product, UUID>, ProductRepositoryCustom {

    boolean existsBySku(String sku);

    boolean existsBySlug(String slug);

    Optional<Product> findBySku(String sku);

    Optional<Product> findBySlug(String slug);
}
