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
import java.util.UUID;

/**
 * Documento de producto almacenado en la coleccion {@code products} de MongoDB.
 *
 * <p>Nunca se expone por REST: los DTO definen el contrato HTTP.</p>
 *
 * <p><b>Diferencias frente a la version con JPA / PostgreSQL:</b></p>
 * <ul>
 *   <li>{@code @Entity} + {@code @Table} pasan a ser {@code @Document}.</li>
 *   <li>Las restricciones {@code UNIQUE} de la tabla se declaran aqui con
 *       {@code @Indexed(unique = true)}: MongoDB las hace cumplir mediante
 *       indices unicos, no mediante constraints de tabla.</li>
 *   <li>Las marcas de tiempo ya no las pone Hibernate ({@code @CreationTimestamp})
 *       sino la auditoria de Spring Data ({@code @CreatedDate}), habilitada en
 *       {@code MongoConfig} con {@code @EnableMongoAuditing}.</li>
 *   <li>El bloqueo optimista se conserva: {@code @Version} de Spring Data compara
 *       la version dentro del propio update del documento.</li>
 *   <li>Ya no hay longitudes de columna ({@code length = 200}): MongoDB no impone
 *       esquema, de modo que ese limite lo garantiza la validacion del DTO.</li>
 * </ul>
 */
@Document(collection = "products")
public class Product {

    /**
     * Se conserva el UUID como identificador en lugar del ObjectId nativo de
     * MongoDB, para que el contrato HTTP no cambie respecto a la version con
     * PostgreSQL: las mismas URL siguen siendo validas.
     */
    @Id
    private UUID id;

    @Indexed(unique = true)
    private String sku;

    @Indexed
    private String name;

    @Indexed(unique = true)
    private String slug;

    private String description;

    /**
     * Se almacena como {@code Decimal128} por la propiedad
     * {@code spring.data.mongodb.representation.big-decimal}. Sin ella Spring
     * Data guardaria el BigDecimal como texto y ordenar por precio seria
     * alfabetico: "9" quedaria despues de "10".
     */
    private BigDecimal price;

    private String currency;

    /** Se guarda como texto, igual que con {@code @Enumerated(EnumType.STRING)}. */
    @Indexed
    private ProductStatus status;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private Instant updatedAt;

    @Version
    private Long version;

    public Product() {
        // Requerido por el mapeo de Spring Data.
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
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
