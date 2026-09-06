import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid px-4 py-4" *ngIf="invoice">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold text-dark m-0">Invoice #{{ invoice.id }}</h2>
          <p class="text-muted m-0">Client: <span class="fw-semibold text-dark">{{ invoice.clientName }}</span></p>
        </div>
        <a routerLink="/invoices" class="btn btn-outline-secondary btn-sm">Back to List</a>
      </div>

      <div class="card shadow-sm border-0 mb-4">
        <div class="card-body p-4">
          <div class="row mb-3">
            <div class="col-md-6">
              <span class="text-muted d-block">Date Issued:</span>
              <span class="fw-semibold">{{ invoice.date | date:'medium' }}</span>
            </div>
            <div class="col-md-6 text-md-end">
              <span class="text-muted d-block">Total Amount:</span>
              <h3 class="fw-bold text-primary m-0">{{ invoice.total | currency }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm border-0">
        <div class="card-header bg-light py-3">
          <h5 class="fw-bold m-0">Purchased Products</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="px-4 py-3">Product Name</th>
                  <th class="px-4 py-3 text-center">Quantity</th>
                  <th class="px-4 py-3 text-end">Unit Price</th>
                  <th class="px-4 py-3 text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of invoice.details">
                  <td class="px-4 py-3 fw-semibold text-dark">{{ item.productName || item.productId }}</td>
                  <td class="px-4 py-3 text-center">{{ item.quantity }}</td>
                  <td class="px-4 py-3 text-end">{{ item.unitPrice | currency }}</td>
                  <td class="px-4 py-3 text-end fw-semibold">{{ item.subtotal | currency }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | null = null;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadInvoiceDetail(id);
    }
  }

  loadInvoiceDetail(id: number): void {
    this.invoiceService.getInvoices().subscribe({
      next: (invoices: Invoice[]) => {
        const found = invoices.find(inv => inv.id === id);
        if (found) {
          this.invoice = found;
        } else {
          console.error('Invoice not found');
        }
      },
      error: (err) => {
        console.error('Error loading invoice details:', err);
      }
    });
  }
}