import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(public auth: AuthService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las categorías.');
        this.loading.set(false);
      }
    });
  }

  /** Total de productos clasificados, para el resumen de la cabecera. */
  totalProducts(): number {
    return this.categories().reduce((suma, c) => suma + c.productCount, 0);
  }

  /**
   * El backend responde 409 cuando la categoría todavía agrupa productos; se
   * muestra ese mensaje tal cual en lugar de un error genérico.
   */
  deleteCategory(c: Category): void {
    if (!confirm(`¿Eliminar la categoría «${c.name}»?`)) return;

    this.categoryService.deleteCategory(c.id).subscribe({
      next: () => this.load(),
      error: (err) =>
        this.errorMessage.set(
          err?.error?.message ?? 'No se pudo eliminar la categoría.'
        )
    });
  }
}
