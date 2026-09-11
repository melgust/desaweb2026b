package com.example.catalog.catalog.service;

import com.example.catalog.catalog.dto.ProductRequest;
import com.example.catalog.catalog.dto.ProductResponse;
import com.example.catalog.catalog.dto.ProductSummaryResponse;
import com.example.catalog.catalog.entity.Product;
import com.example.catalog.catalog.entity.ProductStatus;
import com.example.catalog.catalog.mapper.ProductMapper;
import com.example.catalog.catalog.repository.ProductRepository;
import com.example.catalog.common.exception.DuplicateProductException;
import com.example.catalog.common.exception.ProductNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Pruebas unitarias del servicio con Mockito.
 *
 * <p>Practicamente no cambian respecto a la version con PostgreSQL: la logica de
 * negocio es la misma y el repositorio esta simulado. Es la mejor evidencia de
 * que el cambio de motor quedo confinado a la capa de persistencia.</p>
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    // Se usa el mapeador real para ejercitar tambien el mapeo de respuestas.
    private final ProductMapper productMapper = new ProductMapper();

    private ProductServiceImpl productService;

    private ProductRequest sampleRequest() {
        return new ProductRequest(
                "SKU-1", "iPhone", "iphone", "A phone",
                new BigDecimal("999.9900"), "USD", ProductStatus.ACTIVE);
    }

    private ProductServiceImpl service() {
        if (productService == null) {
            productService = new ProductServiceImpl(productRepository, productMapper);
        }
        return productService;
    }

    @Test
    void createPersistsProductAndReturnsResponse() {
        ProductRequest request = sampleRequest();
        when(productRepository.existsBySku("SKU-1")).thenReturn(false);
        when(productRepository.existsBySlug("iphone")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse response = service().create(request);

        assertThat(response.sku()).isEqualTo("SKU-1");
        assertThat(response.id()).isNotNull();

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isNotNull();
        assertThat(captor.getValue().getStatus()).isEqualTo(ProductStatus.ACTIVE);
    }

    @Test
    void createFailsOnDuplicateSku() {
        when(productRepository.existsBySku("SKU-1")).thenReturn(true);

        assertThatThrownBy(() -> service().create(sampleRequest()))
                .isInstanceOf(DuplicateProductException.class)
                .hasMessageContaining("SKU-1");

        verify(productRepository, never()).save(any());
    }

    @Test
    void createFailsOnDuplicateSlug() {
        when(productRepository.existsBySku("SKU-1")).thenReturn(false);
        when(productRepository.existsBySlug("iphone")).thenReturn(true);

        assertThatThrownBy(() -> service().create(sampleRequest()))
                .isInstanceOf(DuplicateProductException.class)
                .hasMessageContaining("iphone");

        verify(productRepository, never()).save(any());
    }

    @Test
    void getByIdThrowsWhenMissing() {
        UUID id = UUID.randomUUID();
        when(productRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().getById(id))
                .isInstanceOf(ProductNotFoundException.class);
    }

    /**
     * El listado ahora delega en {@code search} del fragmento de repositorio, que
     * es el sustituto de la {@code Specification} de JPA.
     */
    @Test
    void findAllDelegatesToRepositorySearch() {
        Product product = new Product();
        product.setId(UUID.randomUUID());
        product.setSku("SKU-1");
        product.setSlug("iphone");
        product.setName("iPhone");
        product.setPrice(new BigDecimal("999.9900"));
        product.setCurrency("USD");
        product.setStatus(ProductStatus.ACTIVE);

        Pageable pageable = PageRequest.of(0, 10);
        when(productRepository.search(eq(ProductStatus.ACTIVE), isNull(), eq("phone"), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(product), pageable, 1));

        Page<ProductSummaryResponse> page =
                service().findAll(ProductStatus.ACTIVE, null, "phone", pageable);

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().getFirst().sku()).isEqualTo("SKU-1");
        verify(productRepository).search(ProductStatus.ACTIVE, null, "phone", pageable);
    }

    @Test
    void updateModifiesExistingProduct() {
        UUID id = UUID.randomUUID();
        Product existing = new Product();
        existing.setId(id);
        existing.setSku("SKU-1");
        existing.setSlug("iphone");
        existing.setName("Old");
        existing.setPrice(new BigDecimal("1.0000"));
        existing.setCurrency("USD");
        existing.setStatus(ProductStatus.DRAFT);

        when(productRepository.findById(id)).thenReturn(Optional.of(existing));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductRequest request = sampleRequest();
        ProductResponse response = service().update(id, request);

        assertThat(response.name()).isEqualTo("iPhone");
        assertThat(response.status()).isEqualTo(ProductStatus.ACTIVE);
    }

    @Test
    void updateThrowsWhenMissing() {
        UUID id = UUID.randomUUID();
        when(productRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().update(id, sampleRequest()))
                .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    void deleteRemovesExistingProduct() {
        UUID id = UUID.randomUUID();
        when(productRepository.existsById(id)).thenReturn(true);

        service().delete(id);

        verify(productRepository).deleteById(id);
    }

    @Test
    void deleteThrowsWhenMissing() {
        UUID id = UUID.randomUUID();
        when(productRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> service().delete(id))
                .isInstanceOf(ProductNotFoundException.class);

        verify(productRepository, never()).deleteById(any());
    }
}
