package com.example.catalog.catalog.repository;

import com.example.catalog.catalog.entity.Product;
import com.example.catalog.catalog.entity.ProductStatus;
import com.example.catalog.config.MongoAuditingConfig;
import com.example.catalog.support.AbstractMongoIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.mongodb.test.autoconfigure.DataMongoTest;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository slice test running against a real MongoDB container. H2/embedded
 * Mongo is never used.
 *
 * <p>{@code @DataMongoTest} loads a minimal slice context that, by design,
 * does not include general {@code @Configuration} classes such as
 * {@link MongoAuditingConfig}. It is imported explicitly here so the
 * {@code @CreatedDate}/{@code @LastModifiedDate} fields actually get
 * populated in {@link #assignsAuditTimestampsAndVersionOnSave()}.</p>
 */
@DataMongoTest
@Import(MongoAuditingConfig.class)
class ProductRepositoryTest extends AbstractMongoIntegrationTest {

    @Autowired
    private ProductRepository productRepository;

    private Product newProduct(String sku, String slug) {
        Product product = new Product();
        product.setId(UUID.randomUUID().toString());
        product.setSku(sku);
        product.setSlug(slug);
        product.setName("Product " + sku);
        product.setPrice(new BigDecimal("10.0000"));
        product.setCurrency("USD");
        product.setStatus(ProductStatus.ACTIVE);
        return product;
    }

    @Test
    void savesAndFindsBySku() {
        productRepository.save(newProduct("SKU-A", "slug-a"));

        assertThat(productRepository.existsBySku("SKU-A")).isTrue();
        assertThat(productRepository.findBySku("SKU-A")).isPresent();
        assertThat(productRepository.findBySlug("slug-a")).isPresent();
    }

    @Test
    void existsBySlugReturnsFalseWhenMissing() {
        assertThat(productRepository.existsBySlug("does-not-exist")).isFalse();
    }

    @Test
    void assignsAuditTimestampsAndVersionOnSave() {
        Product saved = productRepository.save(newProduct("SKU-B", "slug-b"));

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getVersion()).isNotNull();
    }
}
