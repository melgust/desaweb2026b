import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Client } from '../../../../core/models/client.model';
import { ClientService } from '../../../../core/services/client.service';
import { AuthService } from '../../../../core/services/auth.service';
@Component({ selector: 'app-client-list', standalone: true, imports: [CommonModule, FormsModule, RouterModule], templateUrl: './client-list.component.html' })
export class ClientListComponent implements OnInit {
  clients = signal<Client[]>([]); totalPages = signal(0); page = signal(1); loading = signal(false); searchTerm = ''; sortBy = 'name'; sortDirection: 'asc' | 'desc' = 'asc';
  constructor(public auth: AuthService, private service: ClientService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.service.getClients(this.searchTerm, this.sortBy, this.sortDirection, this.page()).subscribe({ next: r => { this.clients.set(r.items); this.totalPages.set(r.totalPages); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  search(): void { this.page.set(1); this.load(); }
  sort(column: string): void { this.sortDirection = this.sortBy === column && this.sortDirection === 'asc' ? 'desc' : 'asc'; this.sortBy = column; this.search(); }
  setPage(page: number): void { this.page.set(page); this.load(); }
  deactivate(id: string): void { if (confirm('Deactivate client?')) this.service.deleteClient(id).subscribe(() => this.load()); }
}
