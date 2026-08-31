import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import { Category } from '../../../../core/models/category';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    RouterModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSortModule
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent {
  @ViewChild(MatSort) sort!: MatSort;

  categories = signal<Category[]>([]);
  totalItems = signal(0);
  loading = signal(false);

  // Server-side paging state (MatPaginator is zero-based).
  pageIndex = 0;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 25, 50];

  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  displayedColumns: string[] = ['name', 'description'];

  constructor(public auth: AuthService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    if (this.auth.canManageCategories()) {
      this.displayedColumns = [...this.displayedColumns, 'actions'];
    }
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService
      .getCategories(this.searchTerm, this.sortBy, this.sortDirection, this.pageIndex + 1, this.pageSize)
      .subscribe({
        next: (res) => {
          this.categories.set(res.items);
          this.totalItems.set(res.totalItems);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  onSearchChange(): void {
    this.pageIndex = 0;
    this.loadCategories();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortDirection = sort.direction === 'desc' ? 'desc' : 'asc';
    this.pageIndex = 0;
    this.loadCategories();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCategories();
  }

  deleteCategory(id: string): void {
    if (confirm('Delete category?')) {
      this.categoryService.deleteCategory(id).subscribe(() => this.loadCategories());
    }
  }
}
