export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
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