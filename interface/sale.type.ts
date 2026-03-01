import { Product } from "@/interface/products.type";
import { User } from "@/interface/User.type";

export interface BatchSaleItem {
  productId: string;
  quantity: number;
  price: number;
}

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
  orderId: string;
  items: BatchSaleItem[];
  customerName: string;
  customerPhone: string;
  discount?: number; // chegirma summasi
  discountPercent?: number;
  notes?: string;
  totalAmount?: number;
  paidAmount?: number; // ← qo'shing
  dueDate?: Date | null; // ← qo'shing
}

// Grouped order uchun yangi interface
export interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
  price: number;
  totalAmount: number;
}

export interface GroupedOrder {
  orderId: string;
  customerName: string;
  customerPhone: string;
  notes: string;
  timestamp: Date;
  items: OrderItem[];
  totalAmount: number;
  debt: number;
  paidAmount: number;
  status: string;
  discount: number; // ← qo'shing
  discountPercent: number;
}
