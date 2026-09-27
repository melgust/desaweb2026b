package com.example.catalog.customer.service;

import com.example.catalog.customer.dto.CustomerRequest;
import com.example.catalog.customer.dto.CustomerResponse;
import java.util.List;
import java.util.UUID;

public interface CustomerService {
    CustomerResponse create(CustomerRequest request);
    CustomerResponse getById(UUID id);
    List<CustomerResponse> findAll();
}
