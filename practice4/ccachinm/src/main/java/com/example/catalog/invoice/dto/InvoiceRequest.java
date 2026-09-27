package com.example.catalog.invoice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record InvoiceRequest(
    @NotNull UUID customerId,
    @NotEmpty @Valid List<InvoiceItemDto> items
) {}
