package com.example.catalog.catalog.repository;

import com.example.catalog.catalog.entity.Product;
import com.example.catalog.catalog.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB implementation of {@link ProductRepositoryCustom}.
 *
 * <p>Spring Data detects this class automatically because its name matches
 * {@code ProductRepository} + {@code Impl}. It builds a dynamic
 * {@link Criteria} combining the optional status, sku and free-text search
 * parameters, mirroring what {@code JpaSpecificationExecutor} did for
 * PostgreSQL.</p>
 */
@Repository
public class ProductRepositoryImpl implements ProductRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public ProductRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Page<Product> findAll(ProductStatus status, String sku, String search, Pageable pageable) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status));
        }
        if (StringUtils.hasText(sku)) {
            criteriaList.add(Criteria.where("sku").is(sku));
        }
        if (StringUtils.hasText(search)) {
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("name").regex(search, "i"),
                    Criteria.where("description").regex(search, "i")
            ));
        }

        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Product.class);
        List<Product> content = mongoTemplate.find(query.with(pageable), Product.class);

        return new PageImpl<>(content, pageable, total);
    }
}
