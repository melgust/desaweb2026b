import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { ClientService } from '../../../../core/services/client.service';
import { ProductService } from '../../../../core/services/product.service';
import { Client } from '../../../../core/models/client.model';
import { Product } from '../../../../core/models/product.model';

interface InvoiceLineForm {
  productId: string;
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
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {
  isEditMode = false;
  invoiceId: string | null = null;
  loading = false;

  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);

  readonly statusOptions = ['Pending', 'Paid', 'Cancelled'];

  clientId: string | null = null;
  issueDate: string = new Date().toISOString().substring(0, 10);
  status: string = 'Pending';
  lines: InvoiceLineForm[] = [{ productId: '', quantity: 1 }];

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientService.getAllClients().subscribe({
      next: (list) => this.clients.set(list),
      error: () => this.clients.set([])
    });

    this.productService.getAllProducts().subscribe({
      next: (list) => this.products.set(list),
      error: () => this.products.set([])
    });

    this.invoiceId = this.route.snapshot.paramMap.get('id');
    if (this.invoiceId) {
      this.isEditMode = true;
      this.loadInvoice(this.invoiceId);
    }
  }

  loadInvoice(id: string): void {
    this.loading = true;
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.clientId = invoice.clientId;
        this.issueDate = invoice.issueDate.substring(0, 10);
        this.status = invoice.status;
        this.lines = invoice.details.map(d => ({ productId: d.productId, quantity: d.quantity }));
        if (this.lines.length === 0) {
          this.lines = [{ productId: '', quantity: 1 }];
        }
        this.loading = false;
      },
      error: () => this.router.navigate(['/invoices'])
    });
  }

  addLine(): void {
    this.lines.push({ productId: '', quantity: 1 });
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) {
      this.lines.splice(index, 1);
    }
  }

  priceOf(productId: string): number {
    const p = this.products().find(x => x.id === productId);
    return p ? p.price : 0;
  }

  lineSubtotal(line: InvoiceLineForm): number {
    return this.priceOf(line.productId) * (line.quantity || 0);
  }

  get total(): number {
    return this.lines.reduce((sum, line) => sum + this.lineSubtotal(line), 0);
  }

  onSubmit(): void {
    const validLines = this.lines.filter(l => l.productId && l.quantity > 0);
    if (!this.clientId || validLines.length === 0) {
      return;
    }

    this.loading = true;
    const payload = {
      clientId: this.clientId,
      issueDate: this.issueDate,
      status: this.status,
      details: validLines.map(l => ({ productId: l.productId, quantity: l.quantity }))
    };

    const request$ = this.isEditMode && this.invoiceId
      ? this.invoiceService.updateInvoice(this.invoiceId, payload)
      : this.invoiceService.createInvoice(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/invoices']),
      error: () => (this.loading = false)
    });
  }
}