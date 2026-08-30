import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule, MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product } from '../../../../core/models/product.model';

export type ProductPagingMode = 'offset' | 'infinite';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('scrollSentinel') scrollSentinel?: ElementRef<HTMLDivElement>;
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  products = signal<Product[]>([]);
  totalItems = signal(0);
  loading = signal(false);

  /** Which pagination strategy the user currently has selected. */
  pagingMode = signal<ProductPagingMode>('offset');
  /** Whether there are more pages left to fetch in infinite-scroll mode. */
  hasMore = signal(true);

  // Server-side paging state (MatPaginator is zero-based; API page is 1-based).
  pageIndex = 0;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 25, 50];

  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  displayedColumns: string[] = ['name', 'description', 'price', 'stock', 'supplier'];

  private intersectionObserver?: IntersectionObserver;

  constructor(public auth: AuthService, private productService: ProductService) {}

  ngOnInit(): void {
    if (this.auth.canManageProducts()) {
      this.displayedColumns = [...this.displayedColumns, 'actions'];
    }
    this.loadProducts({ append: false });
  }

  ngAfterViewInit(): void {
    this.setupInfiniteScrollObserver();
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  /**
   * Watches the sentinel <div> placed after the table. When it scrolls into
   * view (and we're in infinite-scroll mode) we fetch the next page.
   */
  private setupInfiniteScrollObserver(): void {
    if (!this.scrollSentinel) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const sentinelVisible = entries[0]?.isIntersecting;
        if (sentinelVisible && this.pagingMode() === 'infinite' && !this.loading() && this.hasMore()) {
          this.pageIndex++;
          this.loadProducts({ append: true });
        }
      },
      {
        root: this.scrollContainer?.nativeElement ?? null,
        rootMargin: '0px 0px 200px 0px', // start loading a bit before the sentinel is fully visible
        threshold: 0
      }
    );

    this.intersectionObserver.observe(this.scrollSentinel.nativeElement);
  }

  /** Switches between the classic offset paginator and infinite scroll. */
  setPagingMode(event: MatButtonToggleChange): void {
    const mode = event.value as ProductPagingMode;
    if (this.pagingMode() === mode) {
      return;
    }
    this.pagingMode.set(mode);
    this.resetAndReload();
  }

  private resetAndReload(): void {
    this.pageIndex = 0;
    this.products.set([]);
    this.hasMore.set(true);
    this.loadProducts({ append: false });
  }

  loadProducts(options: { append: boolean }): void {
    this.loading.set(true);
    this.productService
      .getProducts(this.searchTerm, this.sortBy, this.sortDirection, this.pageIndex + 1, this.pageSize)
      .subscribe({
        next: (res) => {
          if (options.append) {
            this.products.update((current) => [...current, ...res.items]);
          } else {
            this.products.set(res.items);
          }
          this.totalItems.set(res.totalItems);
          this.hasMore.set(this.products().length < res.totalItems);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  onSearchChange(): void {
    this.resetAndReload();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortDirection = sort.direction === 'desc' ? 'desc' : 'asc';
    this.resetAndReload();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts({ append: false });
  }

  deleteProduct(id: string): void {
    if (confirm('Delete product?')) {
      this.productService.deleteProduct(id).subscribe(() => this.resetAndReload());
    }
  }
}
