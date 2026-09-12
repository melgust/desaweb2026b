package com.example.catalog.support;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Shared MongoDB Testcontainer for repository and integration tests.
 */
@Testcontainers
public abstract class AbstractMongoIntegrationTest {

    @Container
    @ServiceConnection
    protected static final MongoDBContainer MONGODB =
            new MongoDBContainer("mongo:6.0");

}
