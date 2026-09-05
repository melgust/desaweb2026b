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
  issueDate: string;
  total: number;
  isActive: boolean;
  details: InvoiceDetail[];
}

export interface InvoicePagedResult {
  items: Invoice[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}