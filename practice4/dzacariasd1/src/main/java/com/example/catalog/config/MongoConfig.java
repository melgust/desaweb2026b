package com.example.catalog.config;

import com.mongodb.MongoClientSettings;
import org.bson.UuidRepresentation;
import org.springframework.boot.mongodb.autoconfigure.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Configuracion de MongoDB.
 *
 * <p>{@code @EnableMongoAuditing} activa el relleno automatico de
 * {@code @CreatedDate} y {@code @LastModifiedDate}. Es el sustituto de lo que en
 * la version con JPA hacian las anotaciones de Hibernate
 * {@code @CreationTimestamp} y {@code @UpdateTimestamp}.</p>
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {

    /**
     * Declara como se serializan los UUID.
     *
     * <p><b>Por que hace falta.</b> En PostgreSQL el UUID era un tipo de columna
     * nativo y no habia nada que decidir. MongoDB, en cambio, arrastra varias
     * representaciones binarias distintas por motivos historicos
     * ({@code JAVA_LEGACY}, {@code C_SHARP_LEGACY}, {@code PYTHON_LEGACY} y
     * {@code STANDARD}), y el driver se niega a adivinar: sin esta declaracion
     * falla al guardar con
     * {@code CodecConfigurationException: The uuidRepresentation has not been
     * specified}.</p>
     *
     * <p>Se elige {@code STANDARD} (RFC 4122) porque es la unica interoperable
     * entre lenguajes: si mas adelante otro microservicio en Node o Python lee
     * esta misma coleccion, interpretara los identificadores igual.</p>
     */
    @Bean
    public MongoClientSettingsBuilderCustomizer uuidRepresentationCustomizer() {
        return (MongoClientSettings.Builder builder) ->
                builder.uuidRepresentation(UuidRepresentation.STANDARD);
    }
}
