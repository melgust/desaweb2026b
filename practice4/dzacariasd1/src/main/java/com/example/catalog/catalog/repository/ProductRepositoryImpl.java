package com.example.catalog.catalog.repository;

import com.example.catalog.catalog.entity.Product;
import com.example.catalog.catalog.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Implementacion del filtrado dinamico con {@code MongoTemplate}.
 *
 * <p>Spring Data descubre esta clase por convencion de nombre: el sufijo
 * {@code Impl} sobre el nombre del fragmento {@link ProductRepositoryCustom}.</p>
 *
 * <p>Es el equivalente en MongoDB de la {@code Specification} de JPA que usaba la
 * version con PostgreSQL: en lugar de predicados de Criteria se arma un
 * {@code Criteria} que termina siendo un documento de filtro de MongoDB.</p>
 */
public class ProductRepositoryImpl implements ProductRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public ProductRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Page<Product> search(ProductStatus status, String sku, String search, Pageable pageable) {
        Query query = new Query(buildCriteria(status, sku, search));

        // El conteo debe hacerse con el mismo filtro pero SIN paginacion, de lo
        // contrario el total seria a lo sumo el tamanio de la pagina.
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Product.class);

        List<Product> items = mongoTemplate.find(query.with(pageable), Product.class);

        return new PageImpl<>(items, pageable, total);
    }

    /**
     * Combina los filtros opcionales. La busqueda libre usa una expresion regular
     * sin distinguir mayusculas sobre nombre o descripcion, que es el equivalente
     * del {@code LOWER(...) LIKE '%texto%'} de SQL.
     */
    private Criteria buildCriteria(ProductStatus status, String sku, String search) {
        List<Criteria> conditions = new ArrayList<>();

        if (status != null) {
            conditions.add(Criteria.where("status").is(status));
        }
        if (StringUtils.hasText(sku)) {
            conditions.add(Criteria.where("sku").is(sku));
        }
        if (StringUtils.hasText(search)) {
            // Pattern.quote evita que un texto como "c++" se interprete como
            // metacaracteres de expresion regular.
            String regex = ".*" + Pattern.quote(search) + ".*";
            conditions.add(new Criteria().orOperator(
                    Criteria.where("name").regex(regex, "i"),
                    Criteria.where("description").regex(regex, "i")
            ));
        }

        if (conditions.isEmpty()) {
            return new Criteria();
        }

        return new Criteria().andOperator(conditions.toArray(Criteria[]::new));
    }
}
