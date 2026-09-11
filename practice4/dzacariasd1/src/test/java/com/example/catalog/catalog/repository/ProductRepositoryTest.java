package com.example.catalog.catalog.repository;

import com.example.catalog.catalog.entity.Product;
import com.example.catalog.catalog.entity.ProductStatus;
import com.example.catalog.config.MongoConfig;
import com.example.catalog.support.AbstractMongoIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.mongodb.test.autoconfigure.DataMongoTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Prueba de rebanada del repositorio contra un contenedor real de MongoDB.
 *
 * <p>Equivale al {@code @DataJpaTest} del ejemplo: aqui es {@code @DataMongoTest},
 * que levanta unicamente la capa de Spring Data MongoDB.</p>
 *
 * <p>La rebanada no carga las clases {@code @Configuration} de la aplicacion, de
 * modo que hay que importar {@link MongoConfig} de forma explicita: sin el, ni la
 * representacion de UUID ni la auditoria de fechas estarian configuradas.</p>
 */
@DataMongoTest
@Import(MongoConfig.class)
class ProductRepositoryTest extends AbstractMongoIntegrationTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @BeforeEach
    void limpiarColeccion() {
        productRepository.deleteAll();
    }

    private Product newProduct(String sku, String slug) {
        Product product = new Product();
        product.setId(UUID.randomUUID());
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

    /**
     * El indice unico declarado con {@code @Indexed(unique = true)} debe existir
     * realmente en la coleccion: es lo que sustituye a la restriccion UNIQUE de
     * PostgreSQL.
     */
    @Test
    void uniqueIndexRejectsDuplicatedSku() {
        productRepository.save(newProduct("SKU-DUP", "slug-dup-1"));

        Product otro = newProduct("SKU-DUP", "slug-dup-2");

        assertThatThrownBy(() -> productRepository.save(otro))
                .isInstanceOf(DuplicateKeyException.class);
    }

    /**
     * El precio debe guardarse como Decimal128 y no como texto: de lo contrario
     * ordenar por precio seria alfabetico y "9" quedaria despues de "10".
     */
    @Test
    void storesPriceAsNumberSoSortingIsNumeric() {
        Product barato = newProduct("SKU-9", "slug-9");
        barato.setPrice(new BigDecimal("9.0000"));
        Product caro = newProduct("SKU-10", "slug-10");
        caro.setPrice(new BigDecimal("10.0000"));

        productRepository.save(caro);
        productRepository.save(barato);

        var pagina = productRepository.search(null, null, null,
                PageRequest.of(0, 10, Sort.by("price").ascending()));

        assertThat(pagina.getContent())
                .extracting(Product::getSku)
                .containsExactly("SKU-9", "SKU-10");

        // Y en el documento crudo el campo es numerico, no una cadena.
        org.bson.Document crudo = mongoTemplate.getCollection("products")
                .find(new org.bson.Document("sku", "SKU-9")).first();
        assertThat(crudo).isNotNull();
        assertThat(crudo.get("price")).isInstanceOf(org.bson.types.Decimal128.class);
    }

    @Test
    void searchFiltersByStatusAndFreeText() {
        Product activo = newProduct("SKU-ACT", "slug-act");
        activo.setName("Laptop empresarial");
        activo.setStatus(ProductStatus.ACTIVE);

        Product borrador = newProduct("SKU-DRA", "slug-dra");
        borrador.setName("Laptop de prueba");
        borrador.setStatus(ProductStatus.DRAFT);

        productRepository.save(activo);
        productRepository.save(borrador);

        var soloActivos = productRepository.search(
                ProductStatus.ACTIVE, null, null, PageRequest.of(0, 10));
        assertThat(soloActivos.getTotalElements()).isEqualTo(1);
        assertThat(soloActivos.getContent().getFirst().getSku()).isEqualTo("SKU-ACT");

        // La busqueda libre no distingue mayusculas.
        var porTexto = productRepository.search(null, null, "LAPTOP", PageRequest.of(0, 10));
        assertThat(porTexto.getTotalElements()).isEqualTo(2);
    }

    /**
     * El total de la pagina debe reflejar todas las coincidencias, no solo las
     * que caben en la pagina devuelta.
     */
    @Test
    void paginationReportsFullTotal() {
        for (int i = 0; i < 7; i++) {
            productRepository.save(newProduct("SKU-P" + i, "slug-p" + i));
        }

        var pagina = productRepository.search(null, null, null, PageRequest.of(0, 3));

        assertThat(pagina.getContent()).hasSize(3);
        assertThat(pagina.getTotalElements()).isEqualTo(7);
        assertThat(pagina.getTotalPages()).isEqualTo(3);
    }
}
