export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  /** Cuántos productos tiene asignados. Lo calcula el backend con un COUNT. */
  productCount: number;
}
