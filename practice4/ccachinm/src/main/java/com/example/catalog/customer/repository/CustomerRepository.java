package com.example.catalog.customer.repository;

import com.example.catalog.customer.entity.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.UUID;

public interface CustomerRepository extends MongoRepository<Customer, UUID> {
}
