import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  category: Partial<Category> = {
    name: '',
    description: '',
    isActive: true
  };

  isEditMode = false;
  categoryId?: string;
  loading = false;

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id') ?? undefined;

    if (this.categoryId) {
      this.isEditMode = true;
      this.loadCategory(this.categoryId);
    }
  }

  loadCategory(id: string): void {
    this.loading = true;

    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.category = category;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.category.name?.trim()) {
      alert('Category name is required.');
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.categoryId) {
      this.categoryService
        .updateCategory(this.categoryId, this.category)
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/categories']);
          },
          error: () => {
            this.loading = false;
          }
        });
    } else {
      this.categoryService
        .createCategory(this.category)
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/categories']);
          },
          error: () => {
            this.loading = false;
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/categories']);
  }
}