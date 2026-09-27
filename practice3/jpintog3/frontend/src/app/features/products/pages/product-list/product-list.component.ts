import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product } from '../../../../core/models/product.model';

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
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer')
  scrollContainer?: ElementRef<HTMLDivElement>;

  products = signal<Product[]>([]);
  totalItems = signal(0);
  loading = signal(false);
  errorMessage = signal('');

  paginationMode: 'offset' | 'infinite' = 'offset';

  pageIndex = 0;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 25, 50];

  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  displayedColumns = ['name', 'description', 'price', 'stock', 'supplier'];

  private request?: Subscription;
  private deleteRequest?: Subscription;
  private checkTimer?: ReturnType<typeof setTimeout>;
  private retryAppend = false;

  constructor(
    public auth: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    if (this.auth.canManageProducts()) {
      this.displayedColumns = [...this.displayedColumns, 'actions'];
    }

    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
    this.deleteRequest?.unsubscribe();
    clearTimeout(this.checkTimer);
  }

  hasMore(): boolean {
    return this.products().length < this.totalItems();
  }

  loadProducts(append = false): void {
    if (this.loading()) return;
    if (append && !this.hasMore()) return;

    const requestedIndex = append ? this.pageIndex + 1 : this.pageIndex;

    this.retryAppend = append;
    this.errorMessage.set('');
    this.loading.set(true);

    this.request = this.productService.getProducts(
      this.searchTerm,
      this.sortBy,
      this.sortDirection,
      requestedIndex + 1,
      this.pageSize
    ).subscribe({
      next: (res) => {
        this.products.update(current =>
          append ? [...current, ...res.items] : res.items
        );

        this.totalItems.set(res.totalItems);
        this.pageIndex = requestedIndex;
        this.loading.set(false);

        // Evita solicitar continuamente una página vacía.
        if (append && res.items.length === 0 && this.hasMore()) {
          this.errorMessage.set(
            'La lista cambió. Pulsa Buscar para actualizarla.'
          );
          return;
        }

        // Si los registros no llenan el contenedor, carga otra página.
        clearTimeout(this.checkTimer);
        this.checkTimer = setTimeout(() => this.onScroll(), 0);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudieron cargar los productos.');
      }
    });
  }

  resetList(): void {
    // Cancela la consulta anterior al cambiar filtros o modo.
    this.request?.unsubscribe();
    clearTimeout(this.checkTimer);

    this.loading.set(false);
    this.errorMessage.set('');
    this.products.set([]);
    this.totalItems.set(0);
    this.pageIndex = 0;

    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = 0;
    }

    this.loadProducts();
  }

  onModeChange(): void {
    this.resetList();
  }

  onSearchChange(): void {
    this.resetList();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortDirection = sort.direction === 'desc' ? 'desc' : 'asc';
    this.resetList();
  }

  onPageChange(event: PageEvent): void {
    this.request?.unsubscribe();
    this.loading.set(false);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  onScroll(): void {
    if (
      this.paginationMode !== 'infinite' ||
      this.loading() ||
      this.errorMessage() ||
      !this.hasMore()
    ) {
      return;
    }

    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceToBottom <= 100) {
      this.loadProducts(true);
    }
  }

  retry(): void {
    this.loadProducts(this.retryAppend);
  }

  deleteProduct(id: string): void {
    if (!confirm('¿Eliminar producto?')) return;

    this.deleteRequest = this.productService.deleteProduct(id).subscribe({
      next: () => this.resetList(),
      error: () => alert('No se pudo eliminar el producto.')
    });
  }
}