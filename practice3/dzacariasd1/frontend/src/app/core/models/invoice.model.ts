/** Renglón de una factura ya emitida. */
export interface InvoiceDetail {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/** Fila del listado de facturas: sin los renglones, solo los totales. */
export interface InvoiceSummary {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientNit: string;
  issuedAt: string;
  subtotal: number;
  tax: number;
  total: number;
  lineCount: number;
}

/** Factura completa, con su detalle. */
export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientNit: string;
  clientAddress?: string | null;
  issuedAt: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string | null;
  details: InvoiceDetail[];
}

/**
 * Renglón que se envía al emitir. Solo lleva producto y cantidad: el precio y los
 * totales los calcula el servidor con el precio vigente.
 */
export interface CreateInvoiceDetail {
  productId: string;
  quantity: number;
}

export interface CreateInvoice {
  clientId: string;
  notes?: string | null;
  details: CreateInvoiceDetail[];
}

export interface InvoicePagedResult {
  items: InvoiceSummary[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
