import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { ClientService } from '../../../../core/services/client.service';
import { ProductService } from '../../../../core/services/product.service';
import { Client } from '../../../../core/models/client.model';
import { Product } from '../../../../core/models/product.model';

/** Renglón mientras se arma la factura en pantalla, antes de enviarla. */
interface LineaBorrador {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  stockDisponible: number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {
  /** IVA de Guatemala. Solo para la vista previa: el total real lo calcula el servidor. */
  readonly TASA_IVA = 0.12;

  clients: Client[] = [];
  products: Product[] = [];

  loading = false;
  errorMessage: string | null = null;

  clientId = '';
  notes = '';

  /** Controles de la fila para agregar renglones. */
  productoSeleccionado = '';
  cantidad = 1;
  productSearch = '';

  lineas: LineaBorrador[] = [];

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientService.getClients(true).subscribe({
      next: (res) => (this.clients = res),
      error: () => (this.clients = [])
    });
    this.buscarProductos();
  }

  /** Trae hasta 100 productos que coincidan con la búsqueda, para el desplegable. */
  buscarProductos(): void {
    this.productService.getProducts(this.productSearch, 'name', 'asc', 1, 100).subscribe({
      next: (res) => (this.products = res.items),
      error: () => (this.products = [])
    });
  }

  // ---------------------------------------------------------------- renglones

  agregarLinea(): void {
    this.errorMessage = null;

    const p = this.products.find((x) => x.id === this.productoSeleccionado);
    if (!p) {
      this.errorMessage = 'Seleccione un producto.';
      return;
    }
    if (this.cantidad <= 0) {
      this.errorMessage = 'La cantidad debe ser mayor que cero.';
      return;
    }

    const existente = this.lineas.find((l) => l.productId === p.id);
    const acumulada = (existente?.quantity ?? 0) + this.cantidad;

    if (acumulada > p.stock) {
      this.errorMessage = `Stock insuficiente de «${p.name}»: hay ${p.stock} y estaría solicitando ${acumulada}.`;
      return;
    }

    if (existente) {
      existente.quantity = acumulada;
    } else {
      this.lineas.push({
        productId: p.id,
        productName: p.name,
        unitPrice: p.price,
        quantity: this.cantidad,
        stockDisponible: p.stock
      });
    }

    this.productoSeleccionado = '';
    this.cantidad = 1;
  }

  quitarLinea(index: number): void {
    this.lineas.splice(index, 1);
  }

  // ---------------------------------------------------------------- totales

  totalLinea(l: LineaBorrador): number {
    return l.unitPrice * l.quantity;
  }

  subtotal(): number {
    return this.lineas.reduce((suma, l) => suma + this.totalLinea(l), 0);
  }

  iva(): number {
    return this.subtotal() * this.TASA_IVA;
  }

  total(): number {
    return this.subtotal() + this.iva();
  }

  // ---------------------------------------------------------------- emitir

  /**
   * Envía solo el cliente y los pares producto/cantidad. Los precios y totales
   * los vuelve a calcular el servidor con el precio vigente, así que lo que se ve
   * arriba es una vista previa, no el dato definitivo.
   */
  emitir(): void {
    this.errorMessage = null;

    if (!this.clientId) {
      this.errorMessage = 'Seleccione el cliente al que se emitirá la factura.';
      return;
    }
    if (this.lineas.length === 0) {
      this.errorMessage = 'Agregue al menos un producto a la factura.';
      return;
    }

    this.loading = true;

    this.invoiceService
      .createInvoice({
        clientId: this.clientId,
        notes: this.notes || null,
        details: this.lineas.map((l) => ({ productId: l.productId, quantity: l.quantity }))
      })
      .subscribe({
        next: (factura) => this.router.navigate(['/invoices', factura.id]),
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'No se pudo emitir la factura.';
          this.loading = false;
        }
      });
  }
}
