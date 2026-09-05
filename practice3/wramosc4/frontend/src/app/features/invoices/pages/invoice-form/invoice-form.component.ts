import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { ClientService } from '../../../../core/services/client.service';
import { ProductService } from '../../../../core/services/product.service';

import { Client } from '../../../../core/models/client.model';
import { Product } from '../../../../core/models/product.model';

interface InvoiceLine {
  productId: string | null;
  quantity: number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {

  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);

  isEditMode = false;
  invoiceId: string | null = null;
  loading = false;

  clientId: string | null = null;
  status = 'Pending';

  lines: InvoiceLine[] = [
    {
      productId: null,
      quantity: 1
    }
  ];

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.clientService
      .getAllClients()
      .subscribe({
        next: clients =>
          this.clients.set(clients)
      });

    this.productService
      .getProducts(
        '',
        'name',
        'asc',
        1,
        200
      )
      .subscribe({
        next: result =>
          this.products.set(result.items)
      });

    this.invoiceId =
      this.route.snapshot.paramMap.get('id');

    if (this.invoiceId) {

      this.isEditMode = true;

      this.loadInvoice(
        this.invoiceId
      );
    }
  }

  loadInvoice(id: string): void {

    this.loading = true;

    this.invoiceService
      .getInvoiceById(id)
      .subscribe({
        next: invoice => {

          this.clientId =
            invoice.clientId;

          this.status =
            invoice.status;

          this.lines =
            invoice.details.map(detail => ({
              productId:
                detail.productId,

              quantity:
                detail.quantity
            }));

          this.loading = false;
        },

        error: () => {
          this.router.navigate([
            '/invoices'
          ]);
        }
      });
  }

  addLine(): void {

    this.lines.push({
      productId: null,
      quantity: 1
    });
  }

  removeLine(index: number): void {

    if (this.lines.length === 1) {
      return;
    }

    this.lines.splice(index, 1);
  }

  getProduct(
    productId: string | null
  ): Product | undefined {

    if (!productId) {
      return undefined;
    }

    return this.products()
      .find(
        product =>
          product.id === productId
      );
  }

  getLineSubtotal(
    line: InvoiceLine
  ): number {

    const product =
      this.getProduct(
        line.productId
      );

    if (!product) {
      return 0;
    }

    return (
      product.price *
      Number(line.quantity || 0)
    );
  }

  getTotal(): number {

    return this.lines.reduce(
      (total, line) =>
        total +
        this.getLineSubtotal(line),
      0
    );
  }

  onSubmit(): void {

    if (!this.clientId) {
      alert('Select a client.');
      return;
    }

    const details = this.lines
      .filter(
        line =>
          !!line.productId &&
          line.quantity > 0
      )
      .map(line => ({
        productId:
          line.productId!,
        quantity:
          Number(line.quantity)
      }));

    if (details.length === 0) {
      alert(
        'Add at least one product.'
      );
      return;
    }

    this.loading = true;

    const request$ =
      this.isEditMode &&
      this.invoiceId
        ? this.invoiceService
            .updateInvoice(
              this.invoiceId,
              {
                clientId:
                  this.clientId,

                status:
                  this.status,

                details
              }
            )
        : this.invoiceService
            .createInvoice({
              clientId:
                this.clientId,

              details
            });

    request$.subscribe({
      next: () => {
        this.router.navigate([
          '/invoices'
        ]);
      },

      error: () => {
        this.loading = false;
      }
    });
  }
}