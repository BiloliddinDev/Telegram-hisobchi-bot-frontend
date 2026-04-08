import { Category } from "@/interface/category.type";

export interface Product {
  _id: string;
  name: string;
  price: number;
  costPrice: number;
  category: Category;
  sku: string;
  warehouseQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ProductCreateInput {
  name: string;
  price: number;
  costPrice: number;
  category: string;
  sku?: string;
  warehouseQuantity: number;
}

export interface ProductUpdateInput {
  name?: string;
  price?: number;
  costPrice?: number;
  category?: string;
  sku?: string;
  warehouseQuantity?: number;
  assignedSellers?: string[];
  isActive?: boolean;
}
