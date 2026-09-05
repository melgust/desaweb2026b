export interface InvoiceDetail {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  total: number;
  createdAt: string;
  details: InvoiceDetail[];
}

export interface CreateInvoiceDetailRequest {
  productId: string;
  quantity: number;
}

export interface CreateInvoiceRequest {
  clientId: string;
  details: CreateInvoiceDetailRequest[];
}

export interface InvoicePagedResult {
  items: Invoice[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}