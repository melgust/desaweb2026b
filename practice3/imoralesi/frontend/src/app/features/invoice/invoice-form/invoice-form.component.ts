import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ClientService } from '../../../core/services/client.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid px-4 py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold text-dark m-0">Create New Invoice</h2>
        <a routerLink="/invoices" class="btn btn-outline-secondary btn-sm">Back to List</a>
      </div>

      <div class="card shadow-sm border-0">
        <div class="card-body p-4">
          <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()">
            
            <!-- Client Selection -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Client ID (o selecciona cliente)</label>
              <input type="number" formControlName="clientId" class="form-control" placeholder="Enter Client ID" />
            </div>

            <hr class="my-4">

            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold m-0">Invoice Details (Products)</h5>
              <button type="button" class="btn btn-outline-primary btn-sm" (click)="addDetail()">+ Add Product</button>
            </div>

            <!-- Details FormArray -->
            <div formArrayName="details">
              <div *ngFor="let detail of details.controls; let i = index" [formGroupName]="i" class="row g-3 align-items-center mb-3 p-3 border rounded bg-light">
                
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Product ID (Guid)</label>
                  <input type="text" formControlName="productId" class="form-control" placeholder="Enter Product GUID" />
                </div>

                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Quantity</label>
                  <input type="number" formControlName="quantity" class="form-control" placeholder="1" />
                </div>

                <div class="col-md-2 d-flex align-items-end">
                  <button type="button" class="btn btn-danger btn-sm w-100 mt-4" (click)="removeDetail(i)" [disabled]="details.length === 1">Delete</button>
                </div>

              </div>
            </div>

            <button type="submit" class="btn btn-primary mt-3" [disabled]="invoiceForm.invalid">Save Invoice</button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private invoiceService: InvoiceService
  ) {
    this.invoiceForm = this.fb.group({
      clientId: ['', [Validators.required, Validators.min(1)]],
      details: this.fb.array([this.createDetailFormGroup()])
    });
  }

  ngOnInit(): void {}

  get details(): FormArray {
    return this.invoiceForm.get('details') as FormArray;
  }

  createDetailFormGroup(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addDetail() {
    this.details.push(this.createDetailFormGroup());
  }

  removeDetail(index: number) {
    if (this.details.length > 1) {
      this.details.removeAt(index);
    }
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      console.log('Enviando JSON:', this.invoiceForm.value);
      this.invoiceService.createInvoice(this.invoiceForm.value).subscribe({
        next: () => {
          this.router.navigate(['/invoices']);
        },
        error: (err) => {
          console.error('Error creating invoice:', err);
        }
      });
    }
  }
}