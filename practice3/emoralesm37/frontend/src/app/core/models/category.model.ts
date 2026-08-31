export interface Category {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryPagedResult {
  items: Category[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}