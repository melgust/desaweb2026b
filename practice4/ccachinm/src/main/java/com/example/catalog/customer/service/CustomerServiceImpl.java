package com.example.catalog.customer.service;

import com.example.catalog.customer.dto.CustomerRequest;
import com.example.catalog.customer.dto.CustomerResponse;
import com.example.catalog.customer.entity.Customer;
import com.example.catalog.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {
    
    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public CustomerResponse create(CustomerRequest request) {
        Customer customer = new Customer();
        customer.setId(UUID.randomUUID());
        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        customer.setEmail(request.email());
        customer.setPhone(request.phone());
        
        Customer saved = customerRepository.save(customer);
        return toResponse(saved);
    }

    @Override
    public CustomerResponse getById(UUID id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        return toResponse(customer);
    }

    @Override
    public List<CustomerResponse> findAll() {
        return customerRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    private CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
            customer.getId(),
            customer.getFirstName(),
            customer.getLastName(),
            customer.getEmail(),
            customer.getPhone()
        );
    }
}
