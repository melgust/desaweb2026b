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

import { ClientService } from '../../../../core/services/client.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Client } from '../../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
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
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  clients = signal<Client[]>([]);
  totalItems = signal(0);
  loading = signal(false);

  pageIndex = 0;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 25, 50];

  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  displayedColumns: string[] = [
    'name',
    'nit',
    'address',
    'isActive'
  ];

  constructor(
    public auth: AuthService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    if (this.auth.canManageProducts()) {
      this.displayedColumns = [
        ...this.displayedColumns,
        'actions'
      ];
    }

    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);

    this.clientService
      .getClients(
        this.searchTerm,
        this.sortBy,
        this.sortDirection,
        this.pageIndex + 1,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.clients.set(res.items);
          this.totalItems.set(res.totalItems);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  onSearchChange(): void {
    this.pageIndex = 0;
    this.loadClients();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;

    this.sortDirection =
      sort.direction === 'desc'
        ? 'desc'
        : 'asc';

    this.pageIndex = 0;
    this.loadClients();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadClients();
  }

  deleteClient(id: string): void {
    if (confirm('Delete client?')) {
      this.clientService
        .deleteClient(id)
        .subscribe(() => this.loadClients());
    }
  }
}