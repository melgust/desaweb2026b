import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ClientService } from '../../../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  isEditMode = false;
  clientId: string | null = null;
  loading = false;

  formData = {
    name: '',
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

  loadClient(id: string): void {
    this.loading = true;
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.formData = {
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          address: client.address || '',
          isActive: client.isActive
        };
        this.loading = false;
      },
      error: () => this.router.navigate(['/clients'])
    });
  }

  onSubmit(): void {
    this.loading = true;
    const request$ = this.isEditMode && this.clientId
      ? this.clientService.updateClient(this.clientId, this.formData)
      : this.clientService.createClient(this.formData);

    request$.subscribe({
      next: () => this.router.navigate(['/clients']),
      error: () => (this.loading = false)
    });
  }
}
