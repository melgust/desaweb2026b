package com.example.catalog.invoice.service;

import com.example.catalog.invoice.dto.InvoiceItemDto;
import com.example.catalog.invoice.dto.InvoiceRequest;
import com.example.catalog.invoice.dto.InvoiceResponse;
import com.example.catalog.invoice.entity.Invoice;
import com.example.catalog.invoice.entity.InvoiceItem;
import com.example.catalog.invoice.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    public InvoiceResponse create(InvoiceRequest request) {
        Invoice invoice = new Invoice();
        invoice.setId(UUID.randomUUID());
        invoice.setCustomerId(request.customerId());
        invoice.setDate(LocalDateTime.now());
        
        List<InvoiceItem> items = request.items().stream().map(dto -> {
            InvoiceItem item = new InvoiceItem();
            item.setProductId(dto.productId());
            item.setQuantity(dto.quantity());
            item.setUnitPrice(dto.unitPrice());
            return item;
        }).collect(Collectors.toList());
        
        invoice.setItems(items);
        
        BigDecimal total = items.stream()
            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        invoice.setTotalAmount(total);
        
        Invoice saved = invoiceRepository.save(invoice);
        return toResponse(saved);
    }

    @Override
    public InvoiceResponse getById(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Factura no encontrada"));
        return toResponse(invoice);
    }

    @Override
    public List<InvoiceResponse> findAll() {
        return invoiceRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        List<InvoiceItemDto> itemDtos = invoice.getItems().stream()
            .map(item -> new InvoiceItemDto(item.getProductId(), item.getQuantity(), item.getUnitPrice()))
            .collect(Collectors.toList());
            
        return new InvoiceResponse(
            invoice.getId(),
            invoice.getCustomerId(),
            invoice.getDate(),
            invoice.getTotalAmount(),
            itemDtos
        );
    }
}
