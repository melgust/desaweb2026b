import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClientService } from '../../../../core/services/client.service';
import { CreateClient } from '../../../../core/models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent {
  client: CreateClient = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  submitting = false;

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.submitting = true;
    this.clientService.createClient(this.client).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/clients']);
      },
      error: (err: any) => {
        console.error('Error al crear el cliente', err);
        this.submitting = false;
      }
    });
  }
}