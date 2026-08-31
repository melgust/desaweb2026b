import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Category } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';
import { AuthService } from '../../../../core/services/auth.service';
@Component({ selector: 'app-category-list', standalone: true, imports: [CommonModule, FormsModule, RouterModule], templateUrl: './category-list.component.html', styleUrls: ['./category-list.component.css'] })
export class CategoryListComponent implements OnInit {
  categories = signal<Category[]>([]); totalPages = signal(0); page = signal(1); loading = signal(false); searchTerm = ''; sortBy = 'name'; sortDirection: 'asc' | 'desc' = 'asc';
  constructor(public auth: AuthService, private service: CategoryService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.service.getCategories(this.searchTerm, this.sortBy, this.sortDirection, this.page()).subscribe({ next: r => { this.categories.set(r.items); this.totalPages.set(r.totalPages); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  search(): void { this.page.set(1); this.load(); }
  sort(column: string): void { this.sortDirection = this.sortBy === column && this.sortDirection === 'asc' ? 'desc' : 'asc'; this.sortBy = column; this.search(); }
  setPage(page: number): void { this.page.set(page); this.load(); }
  delete(id: string): void { if (confirm('Delete category? Products linked to it will be unassigned.')) this.service.deleteCategory(id).subscribe(() => this.load()); }
}
