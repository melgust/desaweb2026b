import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientService } from '../../../../core/services/client.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Client } from '../../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  clients = signal<Client[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(public auth: AuthService, private clientService: ClientService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.clientService.getClients().subscribe({
      next: (res) => {
        this.clients.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los clientes.');
        this.loading.set(false);
      }
    });
  }

  totalInvoices(): number {
    return this.clients().reduce((suma, c) => suma + c.invoiceCount, 0);
  }

  /**
   * El backend responde 409 si el cliente ya tiene facturas emitidas; se muestra
   * ese mensaje, que además sugiere marcarlo como inactivo.
   */
  deleteClient(c: Client): void {
    if (!confirm(`¿Eliminar el cliente «${c.name}»?`)) return;

    this.clientService.deleteClient(c.id).subscribe({
      next: () => this.load(),
      error: (err) =>
        this.errorMessage.set(err?.error?.message ?? 'No se pudo eliminar el cliente.')
    });
  }
}
