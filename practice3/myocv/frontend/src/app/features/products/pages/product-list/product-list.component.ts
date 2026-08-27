import { Component, OnInit, signal, AfterViewInit,ViewChild,ElementRef } from '@angular/core';
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
export class ProductListComponent implements OnInit,AfterViewInit  {
  products = signal<Product[]>([]);
  totalItems = signal(0);
  totalPages = signal(0);
  page = signal(1);
  loading = signal(false);

  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';


// ========Infinite Scroll========//
infiniteProducts = signal<Product[]>([]);

infinitePage = signal(1);

infinitePageSize = 10;

infiniteLoading = signal(false);

infiniteHasMore = signal(true);

@ViewChild('scrollTrigger')
scrollTrigger!: ElementRef;
// ========end Infinite Scroll========//


  constructor(public auth: AuthService, private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // ==========added==========//
  ngAfterViewInit(): void {

  const observer = new IntersectionObserver(
    entries => {

      if (entries[0].isIntersecting) {
        this.loadMoreProducts();
      }

    },
    {
      root: null,
      rootMargin: '200px',
      threshold: 0
    }
  );

  observer.observe(this.scrollTrigger.nativeElement);
}

loadMoreProducts(): void {

  if (
    this.infiniteLoading() ||
    !this.infiniteHasMore()
  ) {
    return;
  }

  this.infiniteLoading.set(true);

  this.productService.getProducts(
    '',
    'name',
    'asc',
    this.infinitePage(),
    this.infinitePageSize
  ).subscribe({

    next: (res) => {

      this.infiniteProducts.update(current => [
        ...current,
        ...res.items
      ]);

      if (
        this.infinitePage() >= res.totalPages ||
        res.items.length === 0
      ) {
        this.infiniteHasMore.set(false);
      } else {
        this.infinitePage.update(page => page + 1);
      }

      this.infiniteLoading.set(false);
    },

    error: () => {
      this.infiniteLoading.set(false);
    }

  });
}


// ==========end added==========//

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts(this.searchTerm, this.sortBy, this.sortDirection, this.page()).subscribe({
      next: (res) => {
        this.products.set(res.items);
        this.totalItems.set(res.totalItems);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearchChange(): void {
    this.page.set(1);
    this.loadProducts();
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadProducts();
  }

  deleteProduct(id: string): void {
    if (confirm('Delete product?')) {
      this.productService.deleteProduct(id).subscribe(() => this.loadProducts());
    }
  }

  setPage(p: number): void {
    this.page.set(p);
    this.loadProducts();
  }
}