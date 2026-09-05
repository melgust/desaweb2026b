import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientService } from '../../../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  isEditMode = false;
  clientId: string | null = null;
  loading = false;
  errorMessage: string | null = null;

  formData = {
    name: '',
    nit: '',
    email: '',
    phone: '',
    address: '',
    isActive: true
  };

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id');
    if (this.clientId) {
      this.isEditMode = true;
      this.loadClient(this.clientId);
    }
  }

  private loadClient(id: string): void {
    this.loading = true;
    this.clientService.getClientById(id).subscribe({
      next: (c) => {
        this.formData = {
          name: c.name,
          nit: c.nit,
          email: c.email || '',
          phone: c.phone || '',
          address: c.address || '',
          isActive: c.isActive
        };
        this.loading = false;
      },
      error: () => this.router.navigate(['/clients'])
    });
  }

  /** El backend responde 409 si el NIT ya está registrado en otro cliente. */
  onSubmit(): void {
    this.loading = true;
    this.errorMessage = null;

    const peticion = this.isEditMode && this.clientId
      ? this.clientService.updateClient(this.clientId, this.formData)
      : this.clientService.createClient(this.formData);

    peticion.subscribe({
      next: () => this.router.navigate(['/clients']),
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'No se pudo guardar el cliente.';
        this.loading = false;
      }
    });
  }
}
