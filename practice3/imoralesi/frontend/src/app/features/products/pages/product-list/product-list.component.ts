import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  totalItems = signal(0);
  totalPages = signal(0);
  page = signal(1);
  loading = signal(false);

  // Control de modo: false = Offset Tradicional, true = Scroll Infinito
  isInfiniteScroll = signal(false);

  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(public auth: AuthService, private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // Alternar entre modo Offset Tradicional y Scroll Infinito
  togglePaginationMode(isInfinite: boolean): void {
    if (this.isInfiniteScroll() === isInfinite) return;
    this.isInfiniteScroll.set(isInfinite);
    this.page.set(1);
    this.products.set([]);
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts(this.searchTerm, this.sortBy, this.sortDirection, this.page()).subscribe({
      next: (res) => {
        if (this.isInfiniteScroll() && this.page() > 1) {
          // Scroll Infinito: Acumula los datos manteniendo los anteriores
          this.products.set([...this.products(), ...res.items]);
        } else {
          // Paginación Tradicional o Primera Página: Reemplaza la lista
          this.products.set(res.items);
        }
        this.totalItems.set(res.totalItems);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // Detecta el desplazamiento del mouse en modo Scroll Infinito
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.isInfiniteScroll() || this.loading() || this.page() >= this.totalPages()) {
      return;
    }

    const threshold = 150; // Margen en px antes de tocar el fondo
    const position = window.innerHeight + window.scrollY;
    const height = document.documentElement.scrollHeight;

    if (position >= height - threshold) {
      this.page.update(p => p + 1);
      this.loadProducts();
    }
  }

  onSearchChange(): void {
    this.page.set(1);
    if (this.isInfiniteScroll()) {
      this.products.set([]);
    }
    this.loadProducts();
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page.set(1);
    if (this.isInfiniteScroll()) {
      this.products.set([]);
    }
    this.loadProducts();
  }

  deleteProduct(id: string): void {
    if (confirm('Delete product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.page.set(1);
        if (this.isInfiniteScroll()) {
          this.products.set([]);
        }
        this.loadProducts();
      });
    }
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages() || this.loading()) return;
    this.page.set(p);
    this.loadProducts();
  }
}