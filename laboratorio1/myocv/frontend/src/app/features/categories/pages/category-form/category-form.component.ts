import { Component } from '@angular/core';
import { CategoryService } from '../../../../core/services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css'
})
export class CategoryFormComponent {
  isEditMode = false;
  categoryId: string | null = null;
  loading = false;

  //suppliers = signal<Supplier[]>([]);

  formData = {
    name: '',
    description: ''
  };

  constructor(
    private CategoryService: CategoryService,
    //private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // this.supplierService.getAllSuppliers().subscribe({
    //   next: (list) => this.suppliers.set(list),
    //   error: () => this.suppliers.set([])
    // });

    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (this.categoryId) {
      this.isEditMode = true;
      this.loadCategory(this.categoryId);
    }
  }

  loadCategory(id: string): void {
    this.loading = true;
    this.CategoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.formData = {
          name: category.name,
          description: category.description || ''
        };
        this.loading = false;
      },
      error: () => this.router.navigate(['/Categorys'])
    });
  }

  onSubmit(): void {
    this.loading = true;
    const request$ = this.isEditMode && this.categoryId
      ? this.CategoryService.updateCategory(this.categoryId, this.formData)
      : this.CategoryService.createCategory(this.formData);

    request$.subscribe({
      next: () => this.router.navigate(['/Categorys']),
      error: () => (this.loading = false)
    });
  }
}
