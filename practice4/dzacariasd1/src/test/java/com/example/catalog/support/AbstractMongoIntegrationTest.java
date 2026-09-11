package com.example.catalog.support;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mongodb.MongoDBContainer;

/**
 * Contenedor de MongoDB compartido por las pruebas de repositorio e integracion.
 *
 * <p>Sustituye a {@code AbstractPostgresIntegrationTest}. Se usa MongoDB real en
 * contenedor para cada prueba de persistencia; nunca una base embebida, del mismo
 * modo que el ejemplo original nunca usaba H2.</p>
 *
 * <p>{@link ServiceConnection} inyecta automaticamente la URI de conexion en
 * {@code spring.data.mongodb.uri}.</p>
 */
@Testcontainers
public abstract class AbstractMongoIntegrationTest {

    @Container
    @ServiceConnection
    protected static final MongoDBContainer MONGO = new MongoDBContainer("mongo:8");
}
