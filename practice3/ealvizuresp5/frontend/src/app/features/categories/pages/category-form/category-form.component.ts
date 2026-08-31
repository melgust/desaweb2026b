import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';
@Component({ selector: 'app-category-form', standalone: true, imports: [CommonModule, FormsModule, RouterModule], templateUrl: './category-form.component.html', styleUrls: ['./category-form.component.css'] })
export class CategoryFormComponent implements OnInit {
  id: string | null = null; loading = false; formData = { name: '', description: '', isActive: true };
  constructor(private service: CategoryService, private route: ActivatedRoute, private router: Router) {}
  ngOnInit(): void { this.id = this.route.snapshot.paramMap.get('id'); if (this.id) this.service.getCategoryById(this.id).subscribe({ next: c => this.formData = { name: c.name, description: c.description || '', isActive: c.isActive }, error: () => this.router.navigate(['/categories']) }); }
  submit(): void { this.loading = true; const request = this.id ? this.service.updateCategory(this.id, this.formData) : this.service.createCategory(this.formData); request.subscribe({ next: () => this.router.navigate(['/categories']), error: () => this.loading = false }); }
}
