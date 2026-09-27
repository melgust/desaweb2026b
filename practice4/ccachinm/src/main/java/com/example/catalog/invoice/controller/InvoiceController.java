package com.example.catalog.invoice.controller;

import com.example.catalog.invoice.dto.InvoiceRequest;
import com.example.catalog.invoice.dto.InvoiceResponse;
import com.example.catalog.invoice.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponse create(@Valid @RequestBody InvoiceRequest request) {
        return invoiceService.create(request);
    }

    @GetMapping("/{id}")
    public InvoiceResponse getById(@PathVariable UUID id) {
        return invoiceService.getById(id);
    }

    @GetMapping
    public List<InvoiceResponse> findAll() {
        return invoiceService.findAll();
    }
}
