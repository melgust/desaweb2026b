import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ClientService } from '../../../../core/services/client.service';
import { Client } from '../../../../core/models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  client: Partial<Client> = {
    name: '',
    nit: '',
    address: '',
    isActive: true
  };

  isEditMode = false;
  clientId?: string;
  loading = false;

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientId =
      this.route.snapshot.paramMap.get('id') ?? undefined;

    if (this.clientId) {
      this.isEditMode = true;
      this.loadClient(this.clientId);
    }
  }

  loadClient(id: string): void {
    this.loading = true;

    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.client = client;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.client.name?.trim()) {
      alert('Client name is required.');
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.clientId) {
      this.clientService
        .updateClient(this.clientId, this.client)
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/clients']);
          },
          error: () => {
            this.loading = false;
          }
        });
    } else {
      this.clientService
        .createClient(this.client)
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/clients']);
          },
          error: () => {
            this.loading = false;
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/clients']);
  }
}