import { Category } from "./category.type";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  category: Category;
  sku: string;
  color: string;
  warehouseQuantity: number;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  price: number;
  costPrice: number;
  category: string; // Category ID as string
  sku?: string;
  color?: string;
  warehouseQuantity: number; // Maps to count in Product
  image?: string;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string;
  price?: number;
  costPrice?: number;
  category?: string; // Category ID as string
  sku?: string;
  color?: string;
  warehouseQuantity?: number;
  image?: string;
  assignedSellers?: string[];
  isActive?: boolean;
}
