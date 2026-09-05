import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { forkJoin } from 'rxjs';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { ClientService } from '../../../../core/services/client.service';
import { ProductService } from '../../../../core/services/product.service';

import {
  InvoiceDetail
} from '../../../../core/models/invoice.model';

import {
  Client
} from '../../../../core/models/client.model';

import {
  Product
} from '../../../../core/models/product.model';

@Component({
  selector: 'app-invoice-form',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressBarModule
  ],

  templateUrl:
    './invoice-form.component.html',

  styleUrls: [
    './invoice-form.component.css'
  ]
})
export class InvoiceFormComponent
  implements OnInit {

  isEditMode = false;

  invoiceId:
    string | null = null;

  loading = false;
  saving = false;

  clients: Client[] = [];
  products: Product[] = [];

  formData = {

    invoiceNumber: '',

    invoiceDate:
      this.getCurrentDate(),

    clientId: '',

    total: 0,

    isActive: true,

    details: [] as InvoiceDetail[]
  };

  constructor(
    private invoiceService:
      InvoiceService,

    private clientService:
      ClientService,

    private productService:
      ProductService,

    private route:
      ActivatedRoute,

    private router:
      Router
  ) {}

  ngOnInit(): void {

    this.invoiceId =
      this.route.snapshot
        .paramMap
        .get('id');

    this.isEditMode =
      !!this.invoiceId;

    this.loadCatalogs();
  }


  private getCurrentDate(): string {

    const today =
      new Date();

    return today
      .toISOString()
      .substring(0, 10);
  }


  loadCatalogs(): void {

    this.loading = true;

    forkJoin({

      clients:
        this.clientService
          .getClients(
            undefined,
            'name',
            'asc',
            1,
            1000
          ),

      products:
        this.productService
          .getProducts(
            undefined,
            'name',
            'asc',
            1,
            1000
          )

    }).subscribe({

      next: (result) => {

        this.clients =
          result.clients.items;

        this.products =
          result.products.items;

        if (this.invoiceId) {

          this.loadInvoice(
            this.invoiceId
          );

        } else {

          this.addDetail();

          this.loading = false;
        }
      },

      error: () => {

        this.loading = false;
      }
    });
  }


  loadInvoice(
    id: string
  ): void {

    this.invoiceService
      .getInvoiceById(id)
      .subscribe({

        next: (invoice) => {

          this.formData = {

            invoiceNumber:
              invoice.invoiceNumber,

            invoiceDate:
              invoice.invoiceDate
                .substring(0, 10),

            clientId:
              invoice.clientId,

            total:
              invoice.total,

            isActive:
              invoice.isActive,

            details:
              invoice.details
                ? invoice.details.map(
                    detail => ({
                      ...detail
                    })
                  )
                : []
          };

          if (
            this.formData
              .details.length === 0
          ) {

            this.addDetail();
          }

          this.calculateTotal();

          this.loading = false;
        },

        error: () => {

          this.loading = false;

          this.router.navigate(
            ['/invoices']
          );
        }
      });
  }


  addDetail(): void {

    this.formData.details.push({

      productId: '',

      quantity: 1,

      unitPrice: 0,

      subtotal: 0
    });
  }


  removeDetail(
    index: number
  ): void {

    this.formData.details.splice(
      index,
      1
    );

    this.calculateTotal();
  }


  onProductChange(
    detail: InvoiceDetail
  ): void {

    const product =
      this.products.find(
        p =>
          p.id ===
          detail.productId
      );

    if (!product) {
      return;
    }

    detail.unitPrice =
      Number(product.price);

    this.calculateSubtotal(
      detail
    );
  }


  calculateSubtotal(
    detail: InvoiceDetail
  ): void {

    const quantity =
      Number(detail.quantity) || 0;

    const unitPrice =
      Number(detail.unitPrice) || 0;

    detail.subtotal =
      quantity * unitPrice;

    this.calculateTotal();
  }


  calculateTotal(): void {

    this.formData.total =
      this.formData.details.reduce(
        (
          total,
          detail
        ) => {

          return total +
            Number(
              detail.subtotal || 0
            );

        },
        0
      );
  }


  isFormValid(): boolean {

    if (
      !this.formData.invoiceNumber
    ) {
      return false;
    }

    if (
      !this.formData.clientId
    ) {
      return false;
    }

    if (
      this.formData
        .details.length === 0
    ) {
      return false;
    }

    return this.formData
      .details
      .every(
        detail =>
          !!detail.productId &&
          detail.quantity > 0 &&
          detail.unitPrice >= 0
      );
  }


  onSubmit(): void {

    if (!this.isFormValid()) {
      return;
    }

    this.calculateTotal();

    this.saving = true;

    const payload = {

      invoiceNumber:
        this.formData.invoiceNumber,

      invoiceDate:
        this.formData.invoiceDate,

      clientId:
        this.formData.clientId,

      total:
        this.formData.total,

      isActive:
        this.formData.isActive,

      details:
        this.formData.details.map(
          detail => ({

            id:
              detail.id,

            productId:
              detail.productId,

            quantity:
              Number(
                detail.quantity
              ),

            unitPrice:
              Number(
                detail.unitPrice
              ),

            subtotal:
              Number(
                detail.subtotal
              )
          })
        )
    };

    const request$ =
      this.isEditMode &&
      this.invoiceId

        ? this.invoiceService
            .updateInvoice(
              this.invoiceId,
              payload
            )

        : this.invoiceService
            .createInvoice(
              payload
            );

    request$.subscribe({

      next: () => {

        this.router.navigate(
          ['/invoices']
        );
      },

      error: () => {

        this.saving = false;
      }
    });
  }
}