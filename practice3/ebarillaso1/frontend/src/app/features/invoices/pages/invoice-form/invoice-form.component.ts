import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ClientService } from '../../../../core/services/client.service';
import { ProductService } from '../../../../core/services/product.service';
import { InvoiceService, CreateInvoiceDetailPayload } from '../../../../core/services/invoice.service';
import { Client } from '../../../../core/models/client.model';
import { Product } from '../../../../core/models/product.model';
import { NewInvoiceLine } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);
  lines = signal<NewInvoiceLine[]>([]);

  selectedClientId: string | null = null;
  invoiceDate: string = new Date().toISOString().substring(0, 10);

  selectedProductId: string | null = null;
  selectedQuantity = 1;

  submitting = false;
  errorMessage = signal<string | null>(null);

  readonly lineColumns = ['product', 'unitPrice', 'quantity', 'subtotal', 'actions'];

  total = computed(() => this.lines().reduce((sum, l) => sum + l.unitPrice * l.quantity, 0));

  constructor(
    private clientService: ClientService,
    private productService: ProductService,
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientService.getAllClients().subscribe({
      next: (list) => this.clients.set(list),
      error: () => this.clients.set([])
    });

    // Reuse the existing paginated products endpoint, but ask for a large page
    // so the dropdown has everything available for billing.
    this.productService.getProducts(undefined, 'name', 'asc', 1, 1000).subscribe({
      next: (res) => this.products.set(res.items.filter((p) => p.isActive && p.stock > 0)),
      error: () => this.products.set([])
    });
  }

  get selectedProduct(): Product | undefined {
    return this.products().find((p) => p.id === this.selectedProductId);
  }

  addLine(): void {
    this.errorMessage.set(null);
    const product = this.selectedProduct;
    if (!product || this.selectedQuantity <= 0) {
      return;
    }

    const existing = this.lines().find((l) => l.productId === product.id);
    const alreadyUsed = existing ? existing.quantity : 0;

    if (alreadyUsed + this.selectedQuantity > product.stock) {
      this.errorMessage.set(`Only ${product.stock} unit(s) of "${product.name}" available.`);
      return;
    }

    if (existing) {
      this.lines.update((current) =>
        current.map((l) => (l.productId === product.id ? { ...l, quantity: l.quantity + this.selectedQuantity } : l))
      );
    } else {
      this.lines.update((current) => [
        ...current,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          availableStock: product.stock,
          quantity: this.selectedQuantity
        }
      ]);
    }

    this.selectedProductId = null;
    this.selectedQuantity = 1;
  }

  removeLine(productId: string): void {
    this.lines.update((current) => current.filter((l) => l.productId !== productId));
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (!this.selectedClientId) {
      this.errorMessage.set('Please select a client.');
      return;
    }
    if (this.lines().length === 0) {
      this.errorMessage.set('Add at least one product line.');
      return;
    }

    const details: CreateInvoiceDetailPayload[] = this.lines().map((l) => ({
      productId: l.productId,
      quantity: l.quantity
    }));

    this.submitting = true;
    this.invoiceService
      .createInvoice({
        clientId: this.selectedClientId,
        invoiceDate: new Date(this.invoiceDate).toISOString(),
        details
      })
      .subscribe({
        next: (invoice) => this.router.navigate(['/invoices', invoice.id]),
        error: (err) => {
          this.submitting = false;
          this.errorMessage.set(err?.error?.message || 'Could not create the invoice.');
        }
      });
  }
}
