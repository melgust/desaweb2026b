package com.macifuinaj.catalog.catalog.repository;

import com.macifuinaj.catalog.catalog.entity.Product;
import com.macifuinaj.catalog.catalog.entity.ProductStatus;
import com.macifuinaj.catalog.support.AbstractMongoIntegrationTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository integration test running against a real MongoDB container.
 */
@SpringBootTest
class ProductRepositoryTest extends AbstractMongoIntegrationTest {

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void cleanUp() {
        productRepository.deleteAll();
    }

    private Product newProduct(String sku, String slug) {

        Product product = new Product();

        product.setSku(sku);
        product.setSlug(slug);
        product.setName("Product " + sku);
        product.setDescription("Test product");
        product.setPrice(new BigDecimal("10.0000"));
        product.setCurrency("USD");
        product.setStatus(ProductStatus.ACTIVE);

        return product;
    }

    @Test
    void savesAndFindsBySku() {

        Product saved = productRepository.save(
                newProduct("SKU-A", "slug-a")
        );

        assertThat(saved.getId()).isNotNull();

        assertThat(productRepository.existsBySku("SKU-A"))
                .isTrue();

        assertThat(productRepository.findBySku("SKU-A"))
                .isPresent();

        assertThat(productRepository.findBySlug("slug-a"))
                .isPresent();
    }

    @Test
    void existsBySlugReturnsFalseWhenMissing() {

        assertThat(
                productRepository.existsBySlug("does-not-exist")
        ).isFalse();
    }

    @Test
    void assignsAuditTimestampsAndVersionOnSave() {

        Product saved = productRepository.save(
                newProduct("SKU-B", "slug-b")
        );

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getVersion()).isNotNull();
    }
}