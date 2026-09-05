import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupplierService } from '../../../../core/services/supplier.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Supplier } from '../../../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  suppliers = signal<Supplier[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(public auth: AuthService, private supplierService: SupplierService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.supplierService.getSuppliers().subscribe({
      next: (res) => {
        this.suppliers.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los proveedores.');
        this.loading.set(false);
      }
    });
  }

  totalProducts(): number {
    return this.suppliers().reduce((suma, s) => suma + s.productCount, 0);
  }

  /**
   * Al eliminar un proveedor sus productos NO se borran: quedan sin proveedor
   * asignado. Se advierte en el mensaje de confirmación.
   */
  deleteSupplier(s: Supplier): void {
    const aviso = s.productCount > 0
      ? `¿Eliminar «${s.name}»? Sus ${s.productCount} producto(s) quedarán sin proveedor asignado.`
      : `¿Eliminar el proveedor «${s.name}»?`;

    if (!confirm(aviso)) return;

    this.supplierService.deleteSupplier(s.id).subscribe({
      next: () => this.load(),
      error: (err) =>
        this.errorMessage.set(err?.error?.message ?? 'No se pudo eliminar el proveedor.')
    });
  }
}
