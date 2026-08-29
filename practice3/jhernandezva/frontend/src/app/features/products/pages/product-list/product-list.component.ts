import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  products: Product[] = [];
  page = 1;
  pageSize = 10;
  totalPages = 1;
  totalItems = 0;

  loading = false;
  hasMore = true;
  isInfiniteScroll = false;

  private readonly TRIGGER_MARGIN_PX = 500;
  private scrollHandler = () => this.checkLoadMore();
  private resizeHandler = () => this.checkLoadMore();
  private ticking = false;

  @ViewChild('scrollAnchor', { static: true }) scrollAnchorRef!: ElementRef<HTMLDivElement>;

  constructor(private readonly productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('resize', this.resizeHandler);
  }

  loadProducts(): void {
    if (this.loading || (!this.hasMore && this.isInfiniteScroll)) {
      return;
    }

    this.loading = true;

    this.productService.getProducts(this.page, this.pageSize).subscribe({
      next: (response) => {
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;

        if (this.isInfiniteScroll) {
          this.products = this.page === 1 ? response.items : [...this.products, ...response.items];
        } else {
          this.products = response.items;
        }

        this.hasMore = this.page < this.totalPages;
        this.loading = false;

        if (this.isInfiniteScroll && this.hasMore) {
          // Reevaluamos después de que Angular pinte los nuevos productos,
          // por si el anchor ya quedó visible (pantalla grande) o
          // por si el usuario ya hizo scroll mientras cargaba.
          setTimeout(() => this.checkLoadMore(), 100);
        }
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.loading = false;
      }
    });
  }

  /** Se llama en cada scroll/resize y después de cada carga. No depende de eventos de "cambio de estado". */
  private checkLoadMore(): void {
    if (!this.isInfiniteScroll || this.loading || !this.hasMore) {
      return;
    }

    if (this.ticking) {
      return;
    }
    this.ticking = true;

    requestAnimationFrame(() => {
      this.ticking = false;

      const anchor = this.scrollAnchorRef?.nativeElement;
      if (!anchor) {
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const nearViewport = rect.top <= window.innerHeight + this.TRIGGER_MARGIN_PX;

      if (nearViewport && this.isInfiniteScroll && !this.loading && this.hasMore) {
        this.page++;
        this.loadProducts();
      }
    });
  }

  toggleMode(infinite: boolean): void {
    if (this.isInfiniteScroll === infinite && this.products.length > 0) {
      return;
    }

    this.isInfiniteScroll = infinite;
    this.page = 1;
    this.products = [];
    this.hasMore = true;
    this.loadProducts();
  }

  goToPage(newPage: number): void {
    if (this.isInfiniteScroll || newPage < 1 || newPage > this.totalPages || this.loading) {
      return;
    }

    this.page = newPage;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  trackByProductId(_index: number, product: Product): string {
    return product.id;
  }
}