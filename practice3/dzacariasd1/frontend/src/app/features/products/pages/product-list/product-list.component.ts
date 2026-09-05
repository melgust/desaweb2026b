import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { SupplierService } from '../../../../core/services/supplier.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product } from '../../../../core/models/product.model';
import { Category } from '../../../../core/models/category.model';
import { Supplier } from '../../../../core/models/supplier.model';

/** Estrategia de paginacion activa en la pantalla. */
export type PaginationMode = 'offset' | 'infinite';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Modo de paginacion elegido por el usuario. */
  mode = signal<PaginationMode>('offset');

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  suppliers = signal<Supplier[]>([]);
  totalItems = signal(0);
  totalPages = signal(0);
  page = signal(1);

  /** true mientras se reemplaza toda la tabla (cambio de pagina, busqueda, orden). */
  loading = signal(false);
  /** true mientras el scroll infinito trae el siguiente bloque y lo concatena. */
  loadingMore = signal(false);
  /** Quedan mas productos por cargar en modo scroll infinito. */
  hasMore = signal(false);
  /** Desplazamiento con el que se pedira el proximo bloque. */
  nextOffset = signal(0);
  errorMessage = signal<string | null>(null);

  readonly pageSize = 10;
  readonly scrollLimit = 12;

  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  /** Id de la categoria por la que se filtra. Cadena vacia = todas. */
  categoryFilter = '';
  /** Id del proveedor por el que se filtra. Cadena vacia = todos. */
  supplierFilter = '';

  /** Elemento centinela: cuando entra en pantalla se pide el siguiente bloque. */
  @ViewChild('scrollAnchor') scrollAnchor?: ElementRef<HTMLElement>;
  private observer?: IntersectionObserver;

  constructor(
    public auth: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadSuppliers();
    this.reload();
  }

  ngAfterViewInit(): void {
    // rootMargin adelanta la carga 200px antes de que el centinela sea visible,
    // para que el usuario no llegue a ver el final de la lista vacio.
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) this.loadMore();
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );
    this.observeAnchor();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  // ---------------------------------------------------------------------------
  // Cambio de modo
  // ---------------------------------------------------------------------------

  setMode(mode: PaginationMode): void {
    if (this.mode() === mode) return;
    this.mode.set(mode);
    this.reload();
  }

  // ---------------------------------------------------------------------------
  // Carga de datos
  // ---------------------------------------------------------------------------

  /** Reinicia el listado desde cero con el modo, la busqueda y el orden actuales. */
  private reload(): void {
    this.errorMessage.set(null);
    this.products.set([]);

    if (this.mode() === 'offset') {
      this.loadPage();
    } else {
      this.nextOffset.set(0);
      this.hasMore.set(true);
      this.loadMore(true);
    }
  }

  /** Paginacion por offset: reemplaza el contenido completo de la tabla. */
  private loadPage(): void {
    this.loading.set(true);
    this.productService
      .getProducts(this.searchTerm, this.sortBy, this.sortDirection, this.page(), this.pageSize, this.categoryFilter, this.supplierFilter)
      .subscribe({
        next: (res) => {
          this.products.set(res.items);
          this.totalItems.set(res.totalItems);
          this.totalPages.set(res.totalPages);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('No se pudieron cargar los productos.');
          this.loading.set(false);
        }
      });
  }

  /** Scroll infinito: pide el siguiente bloque y lo concatena al listado. */
  loadMore(isFirstBlock = false): void {
    if (this.mode() !== 'infinite') return;
    if (this.loadingMore()) return;
    if (!isFirstBlock && !this.hasMore()) return;

    this.loadingMore.set(true);
    if (isFirstBlock) this.loading.set(true);

    this.productService
      .getProductsScroll(this.searchTerm, this.sortBy, this.sortDirection, this.nextOffset(), this.scrollLimit, this.categoryFilter, this.supplierFilter)
      .subscribe({
        next: (res) => {
          this.products.update((current) => [...current, ...res.items]);
          this.totalItems.set(res.totalItems);
          this.hasMore.set(res.hasMore);
          this.nextOffset.set(res.nextOffset ?? this.products().length);
          this.loadingMore.set(false);
          this.loading.set(false);
          // Si el bloque recien cargado no llena la pantalla, el centinela sigue
          // visible y IntersectionObserver ya no vuelve a dispararse (no hay
          // transicion). Se comprueba a mano para encadenar la siguiente carga.
          setTimeout(() => this.fillViewport(), 0);
        },
        error: () => {
          this.errorMessage.set('No se pudieron cargar mas productos.');
          this.loadingMore.set(false);
          this.loading.set(false);
        }
      });
  }

  /** Vuelve a pedir datos si el centinela quedo dentro del area visible. */
  private fillViewport(retry = true): void {
    if (!this.hasMore() || this.loadingMore()) return;

    const el = this.scrollAnchor?.nativeElement;
    if (!el) {
      // El centinela todavia no esta en el DOM (por ejemplo justo despues de
      // cambiar de modo): se reintenta una vez en el siguiente ciclo.
      if (retry) setTimeout(() => this.fillViewport(false), 50);
      return;
    }

    this.observeAnchor();

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight) this.loadMore();
  }

  /** (Re)conecta el observador al centinela cuando este existe en el DOM. */
  private observeAnchor(): void {
    const el = this.scrollAnchor?.nativeElement;
    if (this.observer && el) {
      this.observer.disconnect();
      this.observer.observe(el);
    }
  }

  // ---------------------------------------------------------------------------
  // Filtros y acciones
  // ---------------------------------------------------------------------------

  /** Alimenta el desplegable del filtro. Solo se piden las categorias activas. */
  private loadCategories(): void {
    this.categoryService.getCategories(true).subscribe({
      next: (res) => this.categories.set(res),
      error: () => this.categories.set([])
    });
  }

  /** Alimenta el desplegable de proveedores. */
  private loadSuppliers(): void {
    this.supplierService.getSuppliers(true).subscribe({
      next: (res) => this.suppliers.set(res),
      error: () => this.suppliers.set([])
    });
  }

  /** Al cambiar de proveedor se reinicia el listado, igual que con la categoria. */
  onSupplierChange(): void {
    this.page.set(1);
    this.reload();
  }

  selectedSupplierName(): string {
    return this.suppliers().find((s) => s.id === this.supplierFilter)?.name ?? '';
  }

  /** Al cambiar de categoria se reinicia el listado en cualquiera de los dos modos. */
  onCategoryChange(): void {
    this.page.set(1);
    this.reload();
  }

  /** Nombre de la categoria elegida, para mostrarlo en el resumen de resultados. */
  selectedCategoryName(): string {
    return this.categories().find((c) => c.id === this.categoryFilter)?.name ?? '';
  }

  onSearchChange(): void {
    this.page.set(1);
    this.reload();
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page.set(1);
    this.reload();
  }

  sortIcon(column: string): string {
    if (this.sortBy !== column) return '';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  deleteProduct(id: string): void {
    if (confirm('¿Eliminar el producto?')) {
      this.productService.deleteProduct(id).subscribe(() => this.reload());
    }
  }

  setPage(p: number): void {
    if (p < 1 || (this.totalPages() > 0 && p > this.totalPages())) return;
    this.page.set(p);
    this.loadPage();
  }
}
