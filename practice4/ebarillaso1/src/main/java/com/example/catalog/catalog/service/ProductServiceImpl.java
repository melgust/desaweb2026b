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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Default implementation of {@link ProductService}. Holds all business
 * rules: SKU/slug uniqueness, existence checks and transaction boundaries.
 *
 * <p>MongoDB single-document writes are atomic by nature, so
 * {@code @Transactional} here is kept only for consistency with the original
 * layering; it requires a replica-set enabled MongoDB deployment to actually
 * span multi-document transactions (not needed for this single-collection
 * service).</p>
 */
@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(ProductRepository productRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    @Override
    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsBySku(request.sku())) {
            throw DuplicateProductException.forSku(request.sku());
        }
        if (productRepository.existsBySlug(request.slug())) {
            throw DuplicateProductException.forSlug(request.slug());
        }

        Product product = productMapper.toEntity(request);
        product.setId(UUID.randomUUID().toString());

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    public ProductResponse getById(UUID id) {
        Product product = productRepository.findById(id.toString())
                .orElseThrow(() -> new ProductNotFoundException(id));
        return productMapper.toResponse(product);
    }

    @Override
    public Page<ProductSummaryResponse> findAll(
            ProductStatus status,
            String sku,
            String search,
            Pageable pageable) {

        return productRepository.findAll(status, sku, search, pageable)
                .map(productMapper::toSummaryResponse);
    }

    @Override
    public ProductResponse update(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id.toString())
                .orElseThrow(() -> new ProductNotFoundException(id));

        if (!product.getSku().equals(request.sku()) && productRepository.existsBySku(request.sku())) {
            throw DuplicateProductException.forSku(request.sku());
        }
        if (!product.getSlug().equals(request.slug()) && productRepository.existsBySlug(request.slug())) {
            throw DuplicateProductException.forSlug(request.slug());
        }

        productMapper.applyRequest(product, request);
        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID id) {
        String stringId = id.toString();
        if (!productRepository.existsById(stringId)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(stringId);
    }
}
