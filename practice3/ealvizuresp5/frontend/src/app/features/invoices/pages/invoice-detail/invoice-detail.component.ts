import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Invoice } from '../../../../core/models/invoice.model';
import { InvoiceService } from '../../../../core/services/invoice.service';
@Component({ selector: 'app-invoice-detail', standalone: true, imports: [CommonModule, RouterModule], templateUrl: './invoice-detail.component.html', styleUrls: ['./invoice-detail.component.css'] })
export class InvoiceDetailComponent implements OnInit { invoice?: Invoice; constructor(private service: InvoiceService, private route: ActivatedRoute, private router: Router) {} ngOnInit(): void { const id = this.route.snapshot.paramMap.get('id'); if (!id) { this.router.navigate(['/invoices']); return; } this.service.getInvoiceById(id).subscribe({ next: invoice => this.invoice = invoice, error: () => this.router.navigate(['/invoices']) }); } }
