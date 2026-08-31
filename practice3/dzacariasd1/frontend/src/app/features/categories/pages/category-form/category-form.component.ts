import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  isEditMode = false;
  categoryId: string | null = null;
  loading = false;
  errorMessage: string | null = null;

  formData = {
    name: '',
    description: '',
    isActive: true
  };

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (this.categoryId) {
      this.isEditMode = true;
      this.loadCategory(this.categoryId);
    }
  }

  private loadCategory(id: string): void {
    this.loading = true;
    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.formData = {
          name: category.name,
          description: category.description || '',
          isActive: category.isActive
        };
        this.loading = false;
      },
      error: () => this.router.navigate(['/categories'])
    });
  }

  /**
   * El backend responde 409 si el nombre ya existe; se muestra ese mensaje para
   * que quien lo usa sepa exactamente qué corregir.
   */
  onSubmit(): void {
    this.loading = true;
    this.errorMessage = null;

    const peticion = this.isEditMode && this.categoryId
      ? this.categoryService.updateCategory(this.categoryId, this.formData)
      : this.categoryService.createCategory(this.formData);

    peticion.subscribe({
      next: () => this.router.navigate(['/categories']),
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'No se pudo guardar la categoría.';
        this.loading = false;
      }
    });
  }
}
