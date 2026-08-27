import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product } from '../../../../core/models/product.model';

type PaginationMode = 'offset' | 'infinite';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef<HTMLElement>;

  products = signal<Product[]>([]);
  totalItems = signal(0);
  totalPages = signal(0);
  page = signal(1);
  loading = signal(false);
  paginationMode: PaginationMode = 'offset';
  private observer?: IntersectionObserver;
  private reobserveTimer?: ReturnType<typeof setTimeout>;

  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(public auth: AuthService, private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        this.loadNextBlock();
      }
    }, { rootMargin: '200px 0px' });

    this.observer.observe(this.scrollSentinel.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.reobserveTimer) clearTimeout(this.reobserveTimer);
    this.observer?.disconnect();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts(this.searchTerm, this.sortBy, this.sortDirection, this.page()).subscribe({
      next: (res) => {
        const items = this.paginationMode === 'infinite' && this.page() > 1
          ? [...this.products(), ...res.items]
          : res.items;
        this.products.set(items);
        this.totalItems.set(res.totalItems);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
        this.reobserveSentinel();
      },
      error: () => this.loading.set(false)
    });
  }

  onSearchChange(): void {
    this.resetAndLoad();
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.resetAndLoad();
  }

  deleteProduct(id: string): void {
    if (confirm('Delete product?')) {
      this.productService.deleteProduct(id).subscribe(() => this.resetAndLoad());
    }
  }

  setPage(p: number): void {
    this.page.set(p);
    this.loadProducts();
  }

  setPaginationMode(mode: PaginationMode): void {
    if (this.paginationMode === mode) return;
    this.paginationMode = mode;
    this.resetAndLoad();
  }

  loadNextBlock(): void {
    if (this.paginationMode !== 'infinite' || this.loading() || this.page() >= this.totalPages()) return;
    this.page.update(current => current + 1);
    this.loadProducts();
  }

  private resetAndLoad(): void {
    this.page.set(1);
    this.products.set([]);
    this.loadProducts();
  }

  private reobserveSentinel(): void {
    if (this.paginationMode !== 'infinite' || !this.observer) return;

    if (this.reobserveTimer) clearTimeout(this.reobserveTimer);
    this.reobserveTimer = setTimeout(() => {
      const sentinel = this.scrollSentinel.nativeElement;
      this.observer?.unobserve(sentinel);
      this.observer?.observe(sentinel);
    });
  }
}
