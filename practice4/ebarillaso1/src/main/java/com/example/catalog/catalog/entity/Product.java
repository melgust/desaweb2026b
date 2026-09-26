package com.example.catalog.catalog.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Product domain/persistence document.
 *
 * <p>This document is never exposed through REST endpoints; DTOs define the
 * HTTP contract. Stored in the {@code products} collection.</p>
 *
 * <p>The identifier is a UUID represented as {@link String} because MongoDB's
 * native {@code _id} is not a Java {@code UUID} type. The HTTP layer still
 * works with {@code java.util.UUID} (see {@code ProductMapper}).</p>
 */
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("sku")
    private String sku;

    @Field("name")
    private String name;

    @Indexed(unique = true)
    @Field("slug")
    private String slug;

    @Field("description")
    private String description;

    @Field("price")
    private BigDecimal price;

    @Field("currency")
    private String currency;

    // Persisted as text (the enum name), never as an ordinal - this is
    // Spring Data MongoDB's default enum handling.
    @Indexed
    @Field("status")
    private ProductStatus status;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private Instant updatedAt;

    @Version
    @Field("version")
    private Long version;

    public Product() {
        // Required by Spring Data MongoDB.
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Long getVersion() {
        return version;
    }
}
