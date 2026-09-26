package com.example.catalog.support;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mongodb.MongoDBContainer;

/**
 * Shared MongoDB Testcontainer for repository and integration tests.
 *
 * <p>A real MongoDB container is used for every persistence test - no
 * embedded/in-memory Mongo is used. The {@link ServiceConnection} annotation
 * wires {@code spring.data.mongodb.uri} automatically.</p>
 */
@Testcontainers
public abstract class AbstractMongoIntegrationTest {

    @Container
    @ServiceConnection
    protected static final MongoDBContainer MONGO_DB = new MongoDBContainer("mongo:8");
}
