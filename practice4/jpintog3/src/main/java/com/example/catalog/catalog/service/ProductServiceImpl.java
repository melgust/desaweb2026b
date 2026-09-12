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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Implementación del servicio de productos utilizando MongoDB.
 */
@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MongoTemplate mongoTemplate;

    public ProductServiceImpl(
            ProductRepository productRepository,
            ProductMapper productMapper,
            MongoTemplate mongoTemplate) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public ProductResponse create(ProductRequest request) {
        validateUniqueFields(request.sku(), request.slug(), null);

        Product product = productMapper.toEntity(request);
        product.setId(UUID.randomUUID());

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    public ProductResponse getById(UUID id) {
        Product product = findProduct(id);
        return productMapper.toResponse(product);
    }

    @Override
    public Page<ProductSummaryResponse> findAll(
            ProductStatus status,
            String sku,
            String search,
            Pageable pageable) {

        List<Criteria> filters = new ArrayList<>();

        if (status != null) {
            filters.add(Criteria.where("status").is(status));
        }

        if (StringUtils.hasText(sku)) {
            filters.add(Criteria.where("sku").is(sku));
        }

        if (StringUtils.hasText(search)) {
            String safeSearch = Pattern.quote(search.trim());

            filters.add(new Criteria().orOperator(
                    Criteria.where("name").regex(safeSearch, "i"),
                    Criteria.where("description").regex(safeSearch, "i")
            ));
        }

        Query query = new Query();

        if (!filters.isEmpty()) {
            query.addCriteria(
                    new Criteria().andOperator(filters.toArray(Criteria[]::new))
            );
        }

        long total = mongoTemplate.count(query, Product.class);

        query.with(pageable);

        List<ProductSummaryResponse> products = mongoTemplate
                .find(query, Product.class)
                .stream()
                .map(productMapper::toSummaryResponse)
                .toList();

        return new PageImpl<>(products, pageable, total);
    }

    @Override
    public ProductResponse update(UUID id, ProductRequest request) {
        Product product = findProduct(id);

        validateUniqueFields(request.sku(), request.slug(), product);

        productMapper.applyRequest(product, request);

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }

        productRepository.deleteById(id);
    }

    private Product findProduct(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    private void validateUniqueFields(
            String sku,
            String slug,
            Product currentProduct) {

        boolean skuChanged = currentProduct == null
                || !currentProduct.getSku().equals(sku);

        boolean slugChanged = currentProduct == null
                || !currentProduct.getSlug().equals(slug);

        if (skuChanged && productRepository.existsBySku(sku)) {
            throw DuplicateProductException.forSku(sku);
        }

        if (slugChanged && productRepository.existsBySlug(slug)) {
            throw DuplicateProductException.forSlug(slug);
        }
    }
}