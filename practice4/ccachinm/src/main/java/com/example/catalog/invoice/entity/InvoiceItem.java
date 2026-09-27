package com.example.catalog.invoice.entity;

import java.math.BigDecimal;
import java.util.UUID;

public class InvoiceItem {
    private UUID productId;
    private Integer quantity;
    private BigDecimal unitPrice;

    public InvoiceItem() {}

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}
