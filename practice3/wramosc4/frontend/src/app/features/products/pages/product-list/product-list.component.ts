import {
  Component,
  HostListener,
  OnInit,
  ViewChild,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';

import {
  MatSort,
  MatSortModule,
  Sort
} from '@angular/material/sort';

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
export class ProductListComponent implements OnInit {

  @ViewChild(MatSort) sort!: MatSort;

  products = signal<Product[]>([]);
  totalItems = signal(0);
  loading = signal(false);

  pageIndex = 0;
  pageSize = 10;

  readonly pageSizeOptions = [5, 10, 25, 50];

  searchTerm = '';

  sortBy = 'name';

  sortDirection: 'asc' | 'desc' = 'asc';

  paginationMode: 'offset' | 'infinite' = 'offset';

  displayedColumns: string[] = [
    'name',
    'category',
    'supplier',
    'description',
    'price',
    'stock'
  ];

  constructor(
    public auth: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {

    if (this.auth.canManageProducts()) {
      this.displayedColumns = [
        ...this.displayedColumns,
        'actions'
      ];
    }

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
        this.pageIndex + 1,
        this.pageSize
      )
      .subscribe({

        next: (res) => {

          if (append) {

            const current = this.products();

            const currentIds =
              new Set(
                current.map(product => product.id)
              );

            const newProducts =
              res.items.filter(
                product =>
                  !currentIds.has(product.id)
              );

            this.products.set([
              ...current,
              ...newProducts
            ]);

          } else {

            this.products.set(res.items);

          }

          this.totalItems.set(res.totalItems);

          this.loading.set(false);

          if (
            this.paginationMode === 'infinite'
          ) {

            setTimeout(
              () => this.loadIfScreenIsNotFull(),
              0
            );

          }
        },

        error: () => {

          if (
            append &&
            this.pageIndex > 0
          ) {
            this.pageIndex--;
          }

          this.loading.set(false);
        }

      });
  }


  changePaginationMode(
    mode: 'offset' | 'infinite'
  ): void {

    if (
      this.paginationMode === mode
    ) {
      return;
    }

    this.paginationMode = mode;

    this.pageIndex = 0;

    this.products.set([]);

    this.loadProducts();
  }


  onSearchChange(): void {

    this.pageIndex = 0;

    this.products.set([]);

    this.loadProducts();
  }


  clearSearch(): void {

    this.searchTerm = '';

    this.pageIndex = 0;

    this.products.set([]);

    this.loadProducts();
  }


  onSortChange(sort: Sort): void {

    this.sortBy = sort.active;

    this.sortDirection =
      sort.direction === 'desc'
        ? 'desc'
        : 'asc';

    this.pageIndex = 0;

    this.products.set([]);

    this.loadProducts();
  }


  onPageChange(event: PageEvent): void {

    if (
      this.paginationMode !== 'offset'
    ) {
      return;
    }

    this.pageIndex = event.pageIndex;

    this.pageSize = event.pageSize;

    this.loadProducts();
  }


  getTotalPages(): number {

    if (
      this.totalItems() === 0
    ) {
      return 0;
    }

    return Math.ceil(
      this.totalItems() /
      this.pageSize
    );
  }


  private loadNextInfinitePage(): void {

    if (
      this.paginationMode !== 'infinite' ||
      this.loading() ||
      this.pageIndex + 1 >=
        this.getTotalPages()
    ) {
      return;
    }

    this.pageIndex++;

    this.loadProducts(true);
  }


  private loadIfScreenIsNotFull(): void {

    if (
      this.paginationMode !== 'infinite' ||
      this.loading() ||
      this.pageIndex + 1 >=
        this.getTotalPages()
    ) {
      return;
    }

    const pageHeight =
      document.documentElement.scrollHeight;

    const screenHeight =
      window.innerHeight;

    if (
      pageHeight <=
      screenHeight + 120
    ) {
      this.loadNextInfinitePage();
    }
  }


  @HostListener('window:scroll')
  onWindowScroll(): void {

    if (
      this.paginationMode !== 'infinite' ||
      this.loading() ||
      this.pageIndex + 1 >=
        this.getTotalPages()
    ) {
      return;
    }

    const currentPosition =
      window.innerHeight +
      window.scrollY;

    const pageHeight =
      document.documentElement.scrollHeight;

    if (
      currentPosition >=
      pageHeight - 300
    ) {

      this.loadNextInfinitePage();

    }
  }


  deleteProduct(id: string): void {

    if (
      confirm('Delete product?')
    ) {

      this.productService
        .deleteProduct(id)
        .subscribe(() => {

          this.pageIndex = 0;

          this.products.set([]);

          this.loadProducts();

        });
    }
  }
}