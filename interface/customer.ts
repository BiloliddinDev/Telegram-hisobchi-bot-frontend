import { GroupedOrder } from "./sale.type";

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  totalDebt: number;
  lastPurchase?: Date;
}

export interface OrderItem {
  _id: string;
  product?: {
    _id: string;
    name: string;
  };
  price: number;
  quantity: number;
  totalAmount: number;
}

export interface Payment {
  _id: string;
  amount: number;
  notes?: string;
  createdAt: string;
}

export interface CustomerDetailResponse {
  customer: Customer;
  orders: GroupedOrder[];
  payments: Payment[];
}
