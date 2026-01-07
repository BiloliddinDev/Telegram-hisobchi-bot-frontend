import { Product } from "@/interface/products.type";
import { User } from "@/interface/User.type";

export interface Sale {
  _id: string;
  seller: User;
  product: Product;
  quantity: number;
  price: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  note: string;
  timestamp: Date;
  createdAt: Date;
}

export interface CreateSalePayload {
  productId: string;
  quantity: number;
  price: number;
  customerName: string;
  customerPhone: string;
  notes?: string;
}
