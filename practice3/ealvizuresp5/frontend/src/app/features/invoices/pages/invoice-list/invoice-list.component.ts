import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Invoice } from '../../../../core/models/invoice.model';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { AuthService } from '../../../../core/services/auth.service';
@Component({ selector: 'app-invoice-list', standalone: true, imports: [CommonModule, RouterModule], templateUrl: './invoice-list.component.html' })
export class InvoiceListComponent implements OnInit {
  invoices = signal<Invoice[]>([]); totalPages = signal(0); page = signal(1); loading = signal(false);
  constructor(public auth: AuthService, private service: InvoiceService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.service.getInvoices(this.page()).subscribe({ next: r => { this.invoices.set(r.items); this.totalPages.set(r.totalPages); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  setPage(page: number): void { this.page.set(page); this.load(); }
}
