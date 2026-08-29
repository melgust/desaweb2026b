import { Component, HostListener, OnInit, signal } from '@angular/core';
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

  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  readonly pageSize = 10;

  paginationMode: 'offset' | 'infinite' = 'offset';

  constructor(
    public auth: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(append: boolean = false): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);

    this.productService
      .getProducts(
        this.searchTerm,
        this.sortBy,
        this.sortDirection,
        this.page(),
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          if (append) {
            const currentProducts = this.products();
            const currentIds = new Set(
              currentProducts.map(product => product.id)
            );

            const newProducts = res.items.filter(
              product => !currentIds.has(product.id)
            );

            this.products.set([
              ...currentProducts,
              ...newProducts
            ]);
          } else {
            this.products.set(res.items);
          }

          this.totalItems.set(res.totalItems);
          this.totalPages.set(res.totalPages);
          this.loading.set(false);

          if (this.paginationMode === 'infinite') {
            setTimeout(() => this.loadMoreIfNeeded(), 0);
          }
        },
        error: (error) => {
          console.error('Error loading products:', error);

          if (append && this.page() > 1) {
            this.page.update(current => current - 1);
          }

          this.loading.set(false);
        }
      });
  }

  onSearchChange(): void {
    this.resetList();
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }

    this.resetList();
  }

  deleteProduct(id: string): void {
    if (confirm('Delete product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => this.resetList(),
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  setPage(p: number): void {
    if (
      this.paginationMode !== 'offset' ||
      p < 1 ||
      p > this.totalPages() ||
      this.loading()
    ) {
      return;
    }

    this.page.set(p);
    this.loadProducts();
  }

  changePaginationMode(mode: 'offset' | 'infinite'): void {
    if (this.paginationMode === mode) {
      return;
    }

    this.paginationMode = mode;
    this.resetList();
  }

  private resetList(): void {
    this.page.set(1);
    this.products.set([]);
    this.loadProducts();
  }

  private loadNextInfinitePage(): void {
    if (
      this.paginationMode !== 'infinite' ||
      this.loading() ||
      this.page() >= this.totalPages()
    ) {
      return;
    }

    this.page.update(current => current + 1);
    this.loadProducts(true);
  }

  private loadMoreIfNeeded(): void {
    if (
      this.paginationMode !== 'infinite' ||
      this.loading() ||
      this.page() >= this.totalPages()
    ) {
      return;
    }

    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    if (documentHeight <= windowHeight + 100) {
      this.loadNextInfinitePage();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (
      this.paginationMode !== 'infinite' ||
      this.loading() ||
      this.page() >= this.totalPages()
    ) {
      return;
    }

    const scrollPosition =
      window.innerHeight + window.scrollY;

    const documentHeight =
      document.documentElement.scrollHeight;

    const threshold = 250;

    if (scrollPosition >= documentHeight - threshold) {
      this.loadNextInfinitePage();
    }
  }
}