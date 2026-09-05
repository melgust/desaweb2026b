import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { SupplierService } from '../../../../core/services/supplier.service';
import { Category } from '../../../../core/models/category.model';
import { Supplier } from '../../../../core/models/supplier.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  isEditMode = false;
  productId: string | null = null;
  loading = false;

  /** Categorias activas que alimentan el desplegable. */
  categories: Category[] = [];
  /** Proveedores activos que alimentan el desplegable. */
  suppliers: Supplier[] = [];

  formData = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    isActive: true,
    categoryId: '',
    supplierId: ''
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadSuppliers();

    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct(this.productId);
    }
  }

  private loadCategories(): void {
    this.categoryService.getCategories(true).subscribe({
      next: (res) => (this.categories = res),
      error: () => (this.categories = [])
    });
  }

  private loadSuppliers(): void {
    this.supplierService.getSuppliers(true).subscribe({
      next: (res) => (this.suppliers = res),
      error: () => (this.suppliers = [])
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.formData = {
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: product.stock,
          isActive: product.isActive,
          categoryId: product.categoryId || '',
          supplierId: product.supplierId || ''
        };
        this.loading = false;
      },
      error: () => this.router.navigate(['/products'])
    });
  }

  onSubmit(): void {
    this.loading = true;
    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, this.formData).subscribe({
        next: () => this.router.navigate(['/products']),
        error: () => (this.loading = false)
      });
    } else {
      this.productService.createProduct(this.formData).subscribe({
        next: () => this.router.navigate(['/products']),
        error: () => (this.loading = false)
      });
    }
  }
}