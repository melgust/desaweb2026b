export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ClientPagedResult {
  items: Client[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}