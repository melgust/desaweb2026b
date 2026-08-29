import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  signal,
  ElementRef,
  ViewChild
} from '@angular/core';
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
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('scrollSentinel')
  scrollSentinel!: ElementRef;

  products = signal<Product[]>([]);
  totalItems = signal(0);
  totalPages = signal(0);
  page = signal(1);
  loading = signal(false);
  loadingMore = signal(false);

  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  mode: 'pagination' | 'infinite' = 'pagination';

  private observer?: IntersectionObserver;

  constructor(
    public auth: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.createObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  loadProducts(): void {
    this.loading.set(true);

    this.productService.getProducts(
      this.searchTerm,
      this.sortBy,
      this.sortDirection,
      this.page()
    ).subscribe({
      next: (res) => {
        this.products.set(res.items);
        this.totalItems.set(res.totalItems);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadMore(): void {
    if (
      this.loadingMore() ||
      this.loading() ||
      this.page() >= this.totalPages()
    ) {
      return;
    }

    this.loadingMore.set(true);

    const nextPage = this.page() + 1;

    this.productService.getProducts(
      this.searchTerm,
      this.sortBy,
      this.sortDirection,
      nextPage
    ).subscribe({
      next: (res) => {
        this.products.update(current => [
          ...current,
          ...res.items
        ]);

        this.page.set(nextPage);
        this.totalItems.set(res.totalItems);
        this.totalPages.set(res.totalPages);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loadingMore.set(false);
      }
    });
  }

  private createObserver(): void {
    this.observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && this.mode === 'infinite') {
          this.loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0
      }
    );

    if (this.scrollSentinel) {
      this.observer.observe(this.scrollSentinel.nativeElement);
    }
  }

  changeMode(mode: 'pagination' | 'infinite'): void {
    this.mode = mode;
    this.page.set(1);
    this.products.set([]);
    this.loadProducts();
  }

  onSearchChange(): void {
    this.page.set(1);
    this.products.set([]);
    this.loadProducts();
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }

    this.page.set(1);
    this.products.set([]);
    this.loadProducts();
  }

  deleteProduct(id: string): void {
    if (confirm('Delete product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.page.set(1);
        this.loadProducts();
      });
    }
  }

  setPage(p: number): void {
    this.page.set(p);
    this.loadProducts();
  }
}