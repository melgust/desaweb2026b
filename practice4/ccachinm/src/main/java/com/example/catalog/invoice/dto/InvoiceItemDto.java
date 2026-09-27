package com.example.catalog.invoice.dto;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public record InvoiceItemDto(
    @NotNull UUID productId,
    @NotNull @Min(1) Integer quantity,
    @NotNull BigDecimal unitPrice
) {}
