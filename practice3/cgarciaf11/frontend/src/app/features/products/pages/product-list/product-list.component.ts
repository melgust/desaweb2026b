import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Rutas corregidas apuntando a /core/services y /core/models
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product, ProductPagedResult } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  page = signal<number>(1);
  totalPages = signal<number>(1);
  
  searchTerm = '';
  sortBy = 'name';
  sortDirection = 'asc';
  
  paginationMode = signal<'offset' | 'infinite'>('offset');

  constructor(
    private productService: ProductService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(append: boolean = false): void {
    if (this.loading()) return;
    this.loading.set(true);

    this.productService.getProducts(
      this.searchTerm,
      this.sortBy,
      this.sortDirection,
      this.page(),
      10
    ).subscribe({
      next: (res: ProductPagedResult) => {
        if (append && this.paginationMode() === 'infinite') {
          this.products.update(prev => [...prev, ...res.items]);
        } else {
          this.products.set(res.items);
        }
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setPage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.page.set(newPage);
      this.loadProducts(false);
    }
  }

  onSearchChange(): void {
    this.page.set(1);
    this.loadProducts(false);
  }

  toggleSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.page.set(1);
    this.loadProducts(false);
  }

  setPaginationMode(mode: 'offset' | 'infinite'): void {
    this.paginationMode.set(mode);
    this.page.set(1);
    this.loadProducts(false);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.paginationMode() !== 'infinite' || this.loading()) return;

    const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(
      body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight
    );
    const windowBottom = windowHeight + window.pageYOffset;

    if (windowBottom >= docHeight - 100 && this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadProducts(true);
    }
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts(false);
      });
    }
  }
}