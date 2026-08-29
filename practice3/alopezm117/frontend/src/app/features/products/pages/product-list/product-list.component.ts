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
  currentPage = signal(1);
  isLoading = signal(false);

  searchText = '';
  orderField = 'name';
  orderDirection: 'asc' | 'desc' = 'asc';

  readonly pageSize = 10;
  mode: 'offset' | 'infinite' = 'offset';

  constructor(
    public auth: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(append: boolean = false): void {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    this.productService.getProducts(
      this.searchText,
      this.orderField,
      this.orderDirection,
      this.currentPage(),
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (append) {
          const current = this.products();
          const existingIds = new Set(current.map(product => product.id));

          const incoming = response.items.filter(
            product => !existingIds.has(product.id)
          );

          this.products.set([...current, ...incoming]);
        } else {
          this.products.set(response.items);
        }

        this.totalItems.set(response.totalItems);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);

        if (this.mode === 'infinite') {
          setTimeout(() => this.fillViewportIfNeeded(), 0);
        }
      },
      error: (error) => {
        console.error('No se pudieron cargar los productos:', error);

        if (append && this.currentPage() > 1) {
          this.currentPage.update(page => page - 1);
        }

        this.isLoading.set(false);
      }
    });
  }

  search(): void {
    this.restartList();
  }

  applyOrder(): void {
    this.restartList();
  }

  changeMode(newMode: 'offset' | 'infinite'): void {
    if (this.mode === newMode) {
      return;
    }

    this.mode = newMode;
    this.restartList();
  }

  goToPage(page: number): void {
    if (
      this.mode !== 'offset' ||
      this.isLoading() ||
      page < 1 ||
      page > this.totalPages()
    ) {
      return;
    }

    this.currentPage.set(page);
    this.fetchProducts();
  }

  deleteProduct(id: string): void {
    if (!confirm('Desea eliminar este producto?')) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({
      next: () => this.restartList(),
      error: (error) => console.error('No se pudo eliminar el producto:', error)
    });
  }

  private restartList(): void {
    this.currentPage.set(1);
    this.products.set([]);
    this.fetchProducts();
  }

  private loadNextPage(): void {
    if (
      this.mode !== 'infinite' ||
      this.isLoading() ||
      this.currentPage() >= this.totalPages()
    ) {
      return;
    }

    this.currentPage.update(page => page + 1);
    this.fetchProducts(true);
  }

  private fillViewportIfNeeded(): void {
    if (
      this.mode !== 'infinite' ||
      this.isLoading() ||
      this.currentPage() >= this.totalPages()
    ) {
      return;
    }

    const pageHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;

    if (pageHeight <= viewportHeight + 120) {
      this.loadNextPage();
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (
      this.mode !== 'infinite' ||
      this.isLoading() ||
      this.currentPage() >= this.totalPages()
    ) {
      return;
    }

    const currentPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;

    if (currentPosition >= pageHeight - 300) {
      this.loadNextPage();
    }
  }
}
