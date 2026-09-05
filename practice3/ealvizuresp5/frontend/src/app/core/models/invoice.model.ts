export interface InvoiceDetail { id: string; productId: string; productName: string; quantity: number; unitPrice: number; subtotal: number; }
export interface Invoice { id: string; clientId: string; clientName: string; invoiceNumber: string; date: string; total: number; isActive: boolean; createdAt?: string; details?: InvoiceDetail[]; }
export interface InvoicePagedResult { items: Invoice[]; totalItems: number; page: number; pageSize: number; totalPages: number; }
export interface CreateInvoiceRequest { clientId: string; details: { productId: string; quantity: number }[]; }
