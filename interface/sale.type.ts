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
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  paidAmount?: number;
  dueDate?: Date | null;
  discountPercent?: number;
  paymentType?: "naqd" | "nasiya"; // isNasiya o'rniga
}

// Grouped order uchun yangi interface
export interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku?: string;
    price: number;
  };
  quantity: number;
  price: number;
  totalAmount: number;
  status?: string;
}

export interface GroupedOrder {
  orderId: string;
  isCustomer: boolean;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  notes: string;
  timestamp: Date;
  items: OrderItem[];
  totalAmount: number;
  debt: number;
  paidAmount: number;
  status: string;
  rawTotal: number;
  discountPercent: number;
  dueDate?: Date;
}
