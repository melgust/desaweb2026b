package com.example.catalog.invoice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(
    UUID id,
    UUID customerId,
    LocalDateTime date,
    BigDecimal totalAmount,
    List<InvoiceItemDto> items
) {}
