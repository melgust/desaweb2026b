export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

/** Respuesta de la paginacion clasica por offset (botones Anterior / Siguiente). */
export interface ProductPagedResult {
  items: Product[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Respuesta de la paginacion incremental que consume el scroll infinito. */
export interface ProductScrollResult {
  items: Product[];
  offset: number;
  limit: number;
  totalItems: number;
  nextOffset: number | null;
  hasMore: boolean;
}
