import { Product } from "@/interface/products.type";
import { User } from "@/interface/User.type";

export interface Transfer {
  _id: string;
  seller: User;
  product: Product;
  quantity: number;
  type: "transfer" | "return";
  status: "completed" | "cancelled";
  transferDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransferData {
  sellerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface TransferItem {
  productId: string;
  quantity: number;
}

export interface CreateTransferPayload {
  sellerId: string;
  items: TransferItem[];
}

export interface BasketItem {
  product: Product;
  quantity: number;
}
