import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';

import {
  MatSortModule,
  Sort
} from '@angular/material/sort';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
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
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],

  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent
  implements OnInit {

  invoices = signal<Invoice[]>([]);
  totalItems = signal(0);
  loading = signal(false);

  pageIndex = 0;
  pageSize = 10;

  pageSizeOptions =
    [5, 10, 25, 50];

  searchTerm = '';

  sortBy = 'invoiceDate';

  sortDirection:
    'asc' | 'desc' = 'desc';

  displayedColumns: string[] = [
    'invoiceNumber',
    'invoiceDate',
    'clientName',
    'total',
    'isActive'
  ];

  constructor(
    public auth: AuthService,
    private invoiceService:
      InvoiceService
  ) {}

  ngOnInit(): void {

    if (this.auth.canManageProducts()) {
      this.displayedColumns.push(
        'actions'
      );
    }

    this.loadInvoices();
  }

  loadInvoices(): void {

    this.loading.set(true);

    this.invoiceService
      .getInvoices(
        this.searchTerm,
        this.sortBy,
        this.sortDirection,
        this.pageIndex + 1,
        this.pageSize
      )
      .subscribe({

        next: (result) => {

          this.invoices.set(
            result.items
          );

          this.totalItems.set(
            result.totalItems
          );

          this.loading.set(false);
        },

        error: () => {
          this.loading.set(false);
        }
      });
  }

  onSearchChange(): void {

    this.pageIndex = 0;

    this.loadInvoices();
  }

  onSortChange(
    sort: Sort
  ): void {

    this.sortBy =
      sort.active;

    this.sortDirection =
      sort.direction === 'asc'
        ? 'asc'
        : 'desc';

    this.pageIndex = 0;

    this.loadInvoices();
  }

  onPageChange(
    event: PageEvent
  ): void {

    this.pageIndex =
      event.pageIndex;

    this.pageSize =
      event.pageSize;

    this.loadInvoices();
  }

  deleteInvoice(
    id: string
  ): void {

    const confirmed =
      confirm(
        'Are you sure you want to delete this invoice?'
      );

    if (!confirmed) {
      return;
    }

    this.invoiceService
      .deleteInvoice(id)
      .subscribe({
        next: () => {
          this.loadInvoices();
        }
      });
  }
}