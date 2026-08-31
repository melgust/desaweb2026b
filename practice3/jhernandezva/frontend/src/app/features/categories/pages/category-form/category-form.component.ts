import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  isEditMode = false;
  categoryId: number | null = null;
  loading = false;

  formData = {
    name: '',
    description: ''
  };

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.categoryId = Number(idParam);
      this.isEditMode = true;
      this.loadCategory(this.categoryId);
    }
  }

  loadCategory(id: number): void {
    this.loading = true;
    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.formData = {
          name: category.name,
          description: category.description || ''
        };
        this.loading = false;
      },
      error: () => this.router.navigate(['/categories'])
    });
  }

  onSubmit(): void {
    this.loading = true;
    const request$ = this.isEditMode && this.categoryId !== null
      ? this.categoryService.updateCategory(this.categoryId, this.formData)
      : this.categoryService.createCategory(this.formData);

    request$.subscribe({
      next: () => this.router.navigate(['/categories']),
      error: () => (this.loading = false)
    });
  }
}