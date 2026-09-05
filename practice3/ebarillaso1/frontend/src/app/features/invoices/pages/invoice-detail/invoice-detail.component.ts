import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Invoice } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatTableModule, MatButtonModule, MatSelectModule],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoice = signal<Invoice | null>(null);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  updatingStatus = false;

  readonly statusOptions = ['Pending', 'Paid', 'Cancelled'];
  readonly detailColumns = ['product', 'unitPrice', 'quantity', 'subtotal'];

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

  load(id: string): void {
    this.loading.set(true);
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (inv) => {
        this.invoice.set(inv);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Invoice not found.');
        this.loading.set(false);
      }
    });
  }

  onStatusChange(newStatus: string): void {
    const inv = this.invoice();
    if (!inv) return;

    this.updatingStatus = true;
    this.invoiceService.updateStatus(inv.id, newStatus).subscribe({
      next: (updated) => {
        this.invoice.set(updated);
        this.updatingStatus = false;
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Could not update status.');
        this.updatingStatus = false;
      }
    });
  }
}
