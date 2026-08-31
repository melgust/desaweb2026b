import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Supplier } from '../../../../core/models/supplier.model';
import { SupplierService } from '../../../../core/services/supplier.service';
import { AuthService } from '../../../../core/services/auth.service';
@Component({ selector: 'app-supplier-list', standalone: true, imports: [CommonModule, FormsModule, RouterModule], templateUrl: './supplier-list.component.html', styleUrls: ['./supplier-list.component.css'] })
export class SupplierListComponent implements OnInit {
  suppliers = signal<Supplier[]>([]); totalPages = signal(0); page = signal(1); loading = signal(false); searchTerm = ''; sortBy = 'name'; sortDirection: 'asc' | 'desc' = 'asc';
  constructor(public auth: AuthService, private service: SupplierService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.service.getSuppliers(this.searchTerm, this.sortBy, this.sortDirection, this.page()).subscribe({ next: r => { this.suppliers.set(r.items); this.totalPages.set(r.totalPages); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  search(): void { this.page.set(1); this.load(); }
  sort(column: string): void { this.sortDirection = this.sortBy === column && this.sortDirection === 'asc' ? 'desc' : 'asc'; this.sortBy = column; this.search(); }
  setPage(page: number): void { this.page.set(page); this.load(); }
  delete(id: string): void { if (confirm('Delete supplier? Products linked to it will be unassigned.')) this.service.deleteSupplier(id).subscribe(() => this.load()); }
}
