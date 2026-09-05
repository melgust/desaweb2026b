export interface Supplier {
  id: string;
  name: string;
  contactEmail?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  /** Cuántos productos surte. Lo calcula el backend con un COUNT. */
  productCount: number;
}
