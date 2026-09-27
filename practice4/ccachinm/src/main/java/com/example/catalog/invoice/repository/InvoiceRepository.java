package com.example.catalog.invoice.repository;

import com.example.catalog.invoice.entity.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.UUID;

public interface InvoiceRepository extends MongoRepository<Invoice, UUID> {
}
