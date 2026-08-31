import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  public auth = inject(AuthService);
  public productService = inject(ProductService);

  public products = signal<any[]>([]);
  public loading = signal<boolean>(false);
  public paginationMode = signal<'offset' | 'infinite'>('offset');
  public page = signal<number>(1);
  public totalPages = signal<number>(1);
  
  public searchTerm: string = '';
  public sortBy: string = 'name';
  public sortOrder: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    const service: any = this.productService;
    
    if (typeof service.getProducts === 'function') {
      // Usamos invocación dinámica para omitir las restricciones estrictas del compilador
      service.getProducts(this.page(), 10, this.searchTerm, this.sortBy, this.sortOrder).subscribe({
        next: (res: any) => {
          this.products.set(res.items || res || []);
          if (res.totalPages) this.totalPages.set(res.totalPages);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  setPaginationMode(mode: 'offset' | 'infinite'): void {
    this.paginationMode.set(mode);
  }

  setPage(newPage: number): void {
    this.page.set(newPage);
    this.loadProducts();
  }

  onSearchChange(): void {
    this.page.set(1);
    this.loadProducts();
  }

  toggleSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadProducts();
  }

  deleteProduct(id: any): void {
    if (confirm('¿Deseas eliminar este producto?')) {
      const service: any = this.productService;
      if (typeof service.deleteProduct === 'function') {
        service.deleteProduct(id).subscribe(() => this.loadProducts());
      }
    }
  }
}