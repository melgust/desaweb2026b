import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Invoice } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {

  invoices = signal<Invoice[]>([]);
  totalItems = signal(0);
  loading = signal(false);

  pageIndex = 0;
  pageSize = 10;

  readonly pageSizeOptions = [5, 10, 25, 50];

  searchTerm = '';

  displayedColumns: string[] = [
    'date',
    'client',
    'status',
    'items',
    'total'
  ];

  constructor(
    public auth: AuthService,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {

    if (this.auth.canManageProducts()) {
      this.displayedColumns = [
        ...this.displayedColumns,
        'actions'
      ];
    }

    this.loadInvoices();
  }

  loadInvoices(): void {

    this.loading.set(true);

    this.invoiceService
      .getInvoices(
        this.searchTerm,
        this.pageIndex + 1,
        this.pageSize
      )
      .subscribe({
        next: (response) => {
          this.invoices.set(response.items);
          this.totalItems.set(response.totalItems);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  search(): void {
    this.pageIndex = 0;
    this.loadInvoices();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.pageIndex = 0;
    this.loadInvoices();
  }

  pageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadInvoices();
  }

  getTotalPages(): number {

    if (this.totalItems() === 0) {
      return 0;
    }

    return Math.ceil(
      this.totalItems() / this.pageSize
    );
  }

  deleteInvoice(id: string): void {

    if (!confirm('Delete invoice?')) {
      return;
    }

    this.invoiceService
      .deleteInvoice(id)
      .subscribe({
        next: () => this.loadInvoices()
      });
  }
}