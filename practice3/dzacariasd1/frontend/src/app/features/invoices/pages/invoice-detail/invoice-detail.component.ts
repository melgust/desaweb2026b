import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Invoice } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | null = null;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    public auth: AuthService,
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
    this.load(id);
  }

  private load(id: string): void {
    this.loading = true;
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (res) => {
        this.invoice = res;
        this.loading = false;
      },
      error: () => this.router.navigate(['/invoices'])
    });
  }

  /** Anular devuelve al inventario las unidades descontadas al emitir. */
  anular(): void {
    if (!this.invoice) return;
    if (!confirm(`¿Anular la factura ${this.invoice.number}? Las unidades volverán al inventario.`)) return;

    this.invoiceService.deleteInvoice(this.invoice.id).subscribe({
      next: () => this.router.navigate(['/invoices']),
      error: (err) =>
        (this.errorMessage = err?.error?.message ?? 'No se pudo anular la factura.')
    });
  }
}
