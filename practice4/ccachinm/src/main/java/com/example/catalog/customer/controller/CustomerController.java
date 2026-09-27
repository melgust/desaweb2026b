package com.example.catalog.customer.controller;

import com.example.catalog.customer.dto.CustomerRequest;
import com.example.catalog.customer.dto.CustomerResponse;
import com.example.catalog.customer.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request) {
        return customerService.create(request);
    }

    @GetMapping("/{id}")
    public CustomerResponse getById(@PathVariable UUID id) {
        return customerService.getById(id);
    }

    @GetMapping
    public List<CustomerResponse> findAll() {
        return customerService.findAll();
    }
}
