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

/**
 * Default implementation of ProductService using MongoDB.
 * Holds business rules such as SKU/slug uniqueness and existence checks.
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

        if (productRepository.existsBySku(request.sku())) {
            throw DuplicateProductException.forSku(request.sku());
        }

        if (productRepository.existsBySlug(request.slug())) {
            throw DuplicateProductException.forSlug(request.slug());
        }

        Product product = productMapper.toEntity(request);
        product.setId(UUID.randomUUID());

        Product saved = productRepository.save(product);

        return productMapper.toResponse(saved);
    }

    @Override
    public ProductResponse getById(UUID id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        return productMapper.toResponse(product);
    }

    @Override
    public Page<ProductSummaryResponse> findAll(
            ProductStatus status,
            String sku,
            String search,
            Pageable pageable) {

        Query query = buildQuery(status, sku, search);

        long total = mongoTemplate.count(query, Product.class);

        query.with(pageable);

        List<ProductSummaryResponse> products =
                mongoTemplate.find(query, Product.class)
                        .stream()
                        .map(productMapper::toSummaryResponse)
                        .toList();

        return new PageImpl<>(products, pageable, total);
    }

    @Override
    public ProductResponse update(UUID id, ProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        if (!product.getSku().equals(request.sku())
                && productRepository.existsBySku(request.sku())) {

            throw DuplicateProductException.forSku(request.sku());
        }

        if (!product.getSlug().equals(request.slug())
                && productRepository.existsBySlug(request.slug())) {

            throw DuplicateProductException.forSlug(request.slug());
        }

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

    /**
     * Builds a MongoDB query using the optional filters:
     * status, sku and free-text search.
     */
    private Query buildQuery(
            ProductStatus status,
            String sku,
            String search) {

        Query query = new Query();

        List<Criteria> criteria = new ArrayList<>();

        if (status != null) {
            criteria.add(Criteria.where("status").is(status));
        }

        if (StringUtils.hasText(sku)) {
            criteria.add(Criteria.where("sku").is(sku));
        }

        if (StringUtils.hasText(search)) {

            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("name")
                            .regex(search, "i"),
                    Criteria.where("description")
                            .regex(search, "i")
            );

            criteria.add(searchCriteria);
        }

        if (!criteria.isEmpty()) {
            query.addCriteria(
                    new Criteria().andOperator(
                            criteria.toArray(Criteria[]::new)
                    )
            );
        }

        return query;
    }
}