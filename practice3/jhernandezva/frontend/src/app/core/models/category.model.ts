export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CategoryPagedResult {
  items: Category[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}