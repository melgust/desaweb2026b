import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Client } from '../../../../core/models/client.model';
import { Product } from '../../../../core/models/product.model';
import { ClientService } from '../../../../core/services/client.service';
import { ProductService } from '../../../../core/services/product.service';
import { InvoiceService } from '../../../../core/services/invoice.service';
interface DraftDetail { productId: string; productName: string; quantity: number; unitPrice: number; subtotal: number; }
@Component({ selector: 'app-invoice-form', standalone: true, imports: [CommonModule, FormsModule, RouterModule], templateUrl: './invoice-form.component.html', styleUrls: ['./invoice-form.component.css'] })
export class InvoiceFormComponent implements OnInit {
  clients: Client[] = []; products: Product[] = []; details: DraftDetail[] = []; clientId = ''; productId = ''; quantity = 1; loading = false; error = '';
  constructor(private clientsService: ClientService, private productsService: ProductService, private invoicesService: InvoiceService, private router: Router) {}
  ngOnInit(): void { forkJoin({ clients: this.clientsService.getAllClients(), products: this.productsService.getProducts('', 'name', 'asc', 1, 100) }).subscribe(({ clients, products }) => { this.clients = clients; this.products = products.items.filter(p => p.isActive); }); }
  get selectedProduct(): Product | undefined { return this.products.find(p => p.id === this.productId); }
  get total(): number { return this.details.reduce((sum, d) => sum + d.subtotal, 0); }
  addDetail(): void { const product = this.selectedProduct; if (!product || this.quantity <= 0) { this.error = 'Select a product and enter a quantity greater than zero.'; return; } const existing = this.details.find(d => d.productId === product.id); if (existing) { existing.quantity += this.quantity; existing.subtotal = existing.quantity * existing.unitPrice; } else { this.details.push({ productId: product.id, productName: product.name, quantity: this.quantity, unitPrice: product.price, subtotal: product.price * this.quantity }); } this.productId = ''; this.quantity = 1; this.error = ''; }
  removeDetail(index: number): void { this.details.splice(index, 1); }
  save(): void { if (!this.clientId || !this.details.length) { this.error = 'Select a client and add at least one product.'; return; } this.loading = true; this.error = ''; this.invoicesService.createInvoice({ clientId: this.clientId, details: this.details.map(d => ({ productId: d.productId, quantity: d.quantity })) }).subscribe({ next: invoice => this.router.navigate(['/invoices', invoice.id]), error: e => { this.error = e.error?.message || 'Unable to save invoice.'; this.loading = false; } }); }
}
