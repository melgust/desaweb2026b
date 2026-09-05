import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { ClientService } from '../../../../core/services/client.service';
import { AuthService } from '../../../../core/services/auth.service';
import { InvoiceSummary } from '../../../../core/models/invoice.model';
import { Client } from '../../../../core/models/client.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  invoices = signal<InvoiceSummary[]>([]);
  clients = signal<Client[]>([]);
  totalItems = signal(0);
  totalPages = signal(0);
  page = signal(1);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  readonly pageSize = 10;

  searchTerm = '';
  clientFilter = '';

  constructor(
    public auth: AuthService,
    private invoiceService: InvoiceService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.load();
  }

  private loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (res) => this.clients.set(res),
      error: () => this.clients.set([])
    });
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.invoiceService
      .getInvoices(this.searchTerm, this.clientFilter, this.page(), this.pageSize)
      .subscribe({
        next: (res) => {
          this.invoices.set(res.items);
          this.totalItems.set(res.totalItems);
          this.totalPages.set(res.totalPages);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('No se pudieron cargar las facturas.');
          this.loading.set(false);
        }
      });
  }

  onFilterChange(): void {
    this.page.set(1);
    this.load();
  }

  setPage(p: number): void {
    if (p < 1 || (this.totalPages() > 0 && p > this.totalPages())) return;
    this.page.set(p);
    this.load();
  }

  /** Suma facturada de la página que se está viendo. */
  pageTotal(): number {
    return this.invoices().reduce((suma, i) => suma + i.total, 0);
  }

  /** Anular devuelve al inventario las unidades descontadas al emitir. */
  deleteInvoice(i: InvoiceSummary): void {
    if (!confirm(`¿Anular la factura ${i.number}? Las unidades volverán al inventario.`)) return;

    this.invoiceService.deleteInvoice(i.id).subscribe({
      next: () => this.load(),
      error: (err) =>
        this.errorMessage.set(err?.error?.message ?? 'No se pudo anular la factura.')
    });
  }
}
