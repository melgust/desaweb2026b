export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
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

export interface CreateClientRequest {
  name: string;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
}

export interface UpdateClientRequest {
  name: string;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
}