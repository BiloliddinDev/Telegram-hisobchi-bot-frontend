import { Product } from "@/interface/products.type";
import { User } from "@/interface/User.type";

export interface SellerStock {
  _id: string;
  seller: User;
  product: Product;
  quantity: number;
  lastTransferDate: string;
}

export interface StockResponse {
  stocks: SellerStock[];
  summary: {
    totalProducts: number;
    totalQuantity: number;
    totalStockValue: number;
  };
}
