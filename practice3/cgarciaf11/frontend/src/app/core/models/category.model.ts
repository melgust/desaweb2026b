export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  isActive: boolean;
}