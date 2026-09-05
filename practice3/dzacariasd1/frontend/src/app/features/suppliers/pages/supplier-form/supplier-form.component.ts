import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupplierService } from '../../../../core/services/supplier.service';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.css']
})
export class SupplierFormComponent implements OnInit {
  isEditMode = false;
  supplierId: string | null = null;
  loading = false;
  errorMessage: string | null = null;

  formData = {
    name: '',
    contactEmail: '',
    phone: '',
    isActive: true
  };

  constructor(
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.supplierId = this.route.snapshot.paramMap.get('id');
    if (this.supplierId) {
      this.isEditMode = true;
      this.loadSupplier(this.supplierId);
    }
  }

  private loadSupplier(id: string): void {
    this.loading = true;
    this.supplierService.getSupplierById(id).subscribe({
      next: (s) => {
        this.formData = {
          name: s.name,
          contactEmail: s.contactEmail || '',
          phone: s.phone || '',
          isActive: s.isActive
        };
        this.loading = false;
      },
      error: () => this.router.navigate(['/suppliers'])
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = null;

    const peticion = this.isEditMode && this.supplierId
      ? this.supplierService.updateSupplier(this.supplierId, this.formData)
      : this.supplierService.createSupplier(this.formData);

    peticion.subscribe({
      next: () => this.router.navigate(['/suppliers']),
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'No se pudo guardar el proveedor.';
        this.loading = false;
      }
    });
  }
}
