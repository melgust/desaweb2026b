export interface InvoiceDetail {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/** What the UI sends when building a new invoice line, before it's saved. */
export interface NewInvoiceLine {
  productId: string;
  productName: string;
  unitPrice: number;
  availableStock: number;
  quantity: number;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  invoiceDate: string;
  status: 'Pending' | 'Paid' | 'Cancelled';
  total: number;
  createdAt: string;
}

export interface Invoice extends InvoiceListItem {
  details: InvoiceDetail[];
}

export interface InvoicePagedResult {
  items: InvoiceListItem[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
