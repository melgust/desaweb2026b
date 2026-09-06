export interface InvoiceItem {
  id: number;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: number;
  clientId: number;
  clientName?: string;
  date: string;
  total: number;
  details: InvoiceItem[];
}