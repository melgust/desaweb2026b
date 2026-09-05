import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { AuthService } from '../../../../core/services/auth.service';
import { InvoiceListItem } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
export class InvoiceListComponent implements OnInit {
  invoices = signal<InvoiceListItem[]>([]);
  totalItems = signal(0);
  loading = signal(false);

  pageIndex = 0;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 25, 50];

  searchTerm = '';
  sortBy = 'invoiceDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  displayedColumns: string[] = ['invoiceNumber', 'client', 'invoiceDate', 'status', 'total', 'actions'];

  constructor(public auth: AuthService, private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.invoiceService
      .getInvoices(this.searchTerm, this.sortBy, this.sortDirection, this.pageIndex + 1, this.pageSize)
      .subscribe({
        next: (res) => {
          this.invoices.set(res.items);
          this.totalItems.set(res.totalItems);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  onSearchChange(): void {
    this.pageIndex = 0;
    this.loadInvoices();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active === 'client' ? 'client' : sort.active === 'invoiceDate' ? 'invoiceDate' : sort.active;
    this.sortDirection = sort.direction === 'desc' ? 'desc' : 'asc';
    this.pageIndex = 0;
    this.loadInvoices();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadInvoices();
  }

  deleteInvoice(id: string): void {
    if (confirm('Delete this invoice? Product stock will be restored.')) {
      this.invoiceService.deleteInvoice(id).subscribe(() => this.loadInvoices());
    }
  }
}
