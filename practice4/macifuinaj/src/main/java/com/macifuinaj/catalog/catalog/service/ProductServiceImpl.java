package com.macifuinaj.catalog.catalog.service;

import com.macifuinaj.catalog.catalog.dto.ProductRequest;
import com.macifuinaj.catalog.catalog.dto.ProductResponse;
import com.macifuinaj.catalog.catalog.dto.ProductSummaryResponse;
import com.macifuinaj.catalog.catalog.entity.Product;
import com.macifuinaj.catalog.catalog.entity.ProductStatus;
import com.macifuinaj.catalog.catalog.mapper.ProductMapper;
import com.macifuinaj.catalog.catalog.repository.ProductRepository;
import com.macifuinaj.catalog.common.exception.DuplicateProductException;
import com.macifuinaj.catalog.common.exception.ProductNotFoundException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Default implementation of ProductService.
 *
 * Uses MongoDB for persistence and keeps the business rules for
 * SKU/slug uniqueness, existence checks, filtering and pagination.
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

        Product saved = productRepository.save(product);

        return productMapper.toResponse(saved);
    }

    @Override
    public ProductResponse getById(String id) {

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

        Query query = new Query();

        if (status != null) {
            query.addCriteria(
                    Criteria.where("status").is(status)
            );
        }

        if (StringUtils.hasText(sku)) {
            query.addCriteria(
                    Criteria.where("sku").is(sku)
            );
        }

        if (StringUtils.hasText(search)) {

            String searchPattern = Pattern.quote(search.trim());

            query.addCriteria(
                    new Criteria().orOperator(
                            Criteria.where("name")
                                    .regex(searchPattern, "i"),
                            Criteria.where("description")
                                    .regex(searchPattern, "i")
                    )
            );
        }

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
    public ProductResponse update(String id, ProductRequest request) {

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
    public void delete(String id) {

        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }

        productRepository.deleteById(id);
    }
}