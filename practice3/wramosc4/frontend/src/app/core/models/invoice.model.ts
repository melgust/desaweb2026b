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
  clientId: string;
  clientName: string;
  invoiceDate: string;
  total: number;
  status: string;
  details: InvoiceDetail[];
  createdAt: string;
}

export interface CreateInvoiceDetailRequest {
  productId: string;
  quantity: number;
}

export interface CreateInvoiceRequest {
  clientId: string;
  details: CreateInvoiceDetailRequest[];
}

export interface UpdateInvoiceRequest {
  clientId: string;
  status: string;
  details: CreateInvoiceDetailRequest[];
}

export interface InvoicePagedResult {
  items: Invoice[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}