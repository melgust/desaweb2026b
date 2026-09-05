export interface Client {
  id: string;
  name: string;
  /** Número de Identificación Tributaria. Único entre clientes. */
  nit: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  /** Cuántas facturas se le han emitido. */
  invoiceCount: number;
}
