import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientService } from '../../../../core/services/client.service';
@Component({ selector: 'app-client-form', standalone: true, imports: [CommonModule, FormsModule, RouterModule], templateUrl: './client-form.component.html', styleUrls: ['./client-form.component.css'] })
export class ClientFormComponent implements OnInit {
  id: string | null = null; loading = false; error = ''; formData = { name: '', email: '', phone: '', address: '', isActive: true };
  constructor(private service: ClientService, private route: ActivatedRoute, private router: Router) {}
  ngOnInit(): void { this.id = this.route.snapshot.paramMap.get('id'); if (this.id) this.service.getClientById(this.id).subscribe({ next: c => this.formData = { name: c.name, email: c.email, phone: c.phone || '', address: c.address || '', isActive: c.isActive }, error: () => this.router.navigate(['/clients']) }); }
  submit(): void { this.loading = true; this.error = ''; const request = this.id ? this.service.updateClient(this.id, this.formData) : this.service.createClient(this.formData); request.subscribe({ next: () => this.router.navigate(['/clients']), error: e => { this.error = e.error?.message || 'Unable to save client.'; this.loading = false; } }); }
}
