package com.example.catalog.catalog.repository;

import com.example.catalog.catalog.entity.Product;
import com.example.catalog.catalog.entity.ProductStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
    }

    @Test
    @DisplayName("Debe guardar y recuperar un producto por ID")
    void shouldSaveAndFindById() {
        UUID id = UUID.randomUUID();
        Product product = new Product();
        product.setId(id);
        product.setSku("TEST-SKU-001");
        product.setName("Producto Test");
        product.setSlug("producto-test");
        product.setPrice(new BigDecimal("99.99"));
        product.setStatus(ProductStatus.ACTIVE);
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());

        productRepository.save(product);

        assertThat(productRepository.findById(id)).isPresent();
        assertThat(productRepository.existsBySku("TEST-SKU-001")).isTrue();
    }
}