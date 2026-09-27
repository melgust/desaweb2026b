package com.example.catalog.invoice.service;

import com.example.catalog.invoice.dto.InvoiceRequest;
import com.example.catalog.invoice.dto.InvoiceResponse;
import java.util.List;
import java.util.UUID;

public interface InvoiceService {
    InvoiceResponse create(InvoiceRequest request);
    InvoiceResponse getById(UUID id);
    List<InvoiceResponse> findAll();
}
