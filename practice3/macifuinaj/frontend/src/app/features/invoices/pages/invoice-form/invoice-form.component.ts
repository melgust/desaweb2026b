import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ClientService } from '../../../../core/services/client.service';
import { ProductService } from '../../../../core/services/product.service';
import { InvoiceService } from '../../../../core/services/invoice.service';

import { Client } from '../../../../core/models/client.model';
import { Product } from '../../../../core/models/product.model';
import {
  CreateInvoiceRequest
} from '../../../../core/models/invoice.model';

interface InvoiceLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {

  clients: Client[] = [];
  products: Product[] = [];

  clientId = '';

  selectedProductId = '';
  quantity = 1;

  details: InvoiceLine[] = [];

  loading = false;

  constructor(
    private clientService: ClientService,
    private productService: ProductService,
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadProducts();
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: () => {
        alert('Could not load clients.');
      }
    });
  }

  loadProducts(): void {
    this.productService
      .getProducts(
        '',
        'name',
        'asc',
        1,
        100
      )
      .subscribe({
        next: (response) => {
          this.products = response.items
            .filter(product => product.isActive);
        },
        error: () => {
          alert('Could not load products.');
        }
      });
  }

  addProduct(): void {
    if (!this.selectedProductId) {
      alert('Select a product.');
      return;
    }

    if (this.quantity <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }

    const product = this.products.find(
      p => p.id === this.selectedProductId
    );

    if (!product) {
      return;
    }

    const existing = this.details.find(
      d => d.productId === product.id
    );

    if (existing) {
      existing.quantity += this.quantity;
      existing.subtotal =
        existing.quantity * existing.unitPrice;
    } else {
      this.details.push({
        productId: product.id,
        productName: product.name,
        quantity: this.quantity,
        unitPrice: product.price,
        subtotal: product.price * this.quantity
      });
    }

    this.selectedProductId = '';
    this.quantity = 1;
  }

  removeProduct(index: number): void {
    this.details.splice(index, 1);
  }

  get total(): number {
    return this.details.reduce(
      (sum, detail) => sum + detail.subtotal,
      0
    );
  }

  save(): void {
    if (!this.clientId) {
      alert('Select a client.');
      return;
    }

    if (this.details.length === 0) {
      alert('Add at least one product.');
      return;
    }

    const request: CreateInvoiceRequest = {
      clientId: this.clientId,
      details: this.details.map(detail => ({
        productId: detail.productId,
        quantity: detail.quantity
      }))
    };

    this.loading = true;

    this.invoiceService.createInvoice(request).subscribe({
      next: (invoice) => {
        this.loading = false;

        this.router.navigate([
          '/invoices',
          invoice.id
        ]);
      },
      error: () => {
        this.loading = false;
        alert('Could not create invoice.');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/invoices']);
  }
}