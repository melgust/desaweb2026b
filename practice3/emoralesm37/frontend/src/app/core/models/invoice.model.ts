export interface InvoiceDetail {
  id?: string;
  productId: string;
  productName?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  total: number;
  isActive: boolean;
  createdAt: string;

  clientId: string;
  clientName?: string | null;

  details: InvoiceDetail[];
}

export interface InvoicePagedResult {
  items: Invoice[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}