import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  clients = signal<Client[]>([]);
  totalItems = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);
  isLoading = signal(false);

  searchText = '';
  orderField = 'name';
  orderDirection: 'asc' | 'desc' = 'asc';
  readonly pageSize = 10;

  constructor(public auth: AuthService, private clientService: ClientService) {}

  ngOnInit(): void {
    this.fetchClients();
  }

  fetchClients(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    this.clientService.getClients(this.searchText, this.orderField, this.orderDirection, this.currentPage(), this.pageSize)
      .subscribe({
        next: (response) => {
          this.clients.set(response.items);
          this.totalItems.set(response.totalItems);
          this.totalPages.set(response.totalPages);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('No se pudieron cargar los clientes:', error);
          this.isLoading.set(false);
        }
      });
  }

  search(): void { this.restartList(); }
  applyOrder(): void { this.restartList(); }

  goToPage(page: number): void {
    if (this.isLoading() || page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.fetchClients();
  }

  deleteClient(id: string): void {
    if (!confirm('Desea eliminar este cliente?')) return;
    this.clientService.deleteClient(id).subscribe({
      next: () => this.restartList(),
      error: (error) => console.error('No se pudo eliminar el cliente:', error)
    });
  }

  private restartList(): void {
    this.currentPage.set(1);
    this.clients.set([]);
    this.fetchClients();
  }
}