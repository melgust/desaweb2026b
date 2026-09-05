import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { Invoice } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {

  invoice?: Invoice;
  loading = false;

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/invoices']);
      return;
    }

    this.loadInvoice(id);
  }

  loadInvoice(id: string): void {
    this.loading = true;

    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Could not load invoice.');
        this.router.navigate(['/invoices']);
      }
    });
  }

  back(): void {
    this.router.navigate(['/invoices']);
  }
}