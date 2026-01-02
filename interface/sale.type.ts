import {Product} from "@/interface/products.type";

export interface Sale {
    _id: string;
    product: Product;
    quantity: number;
    price: number;
    totalPrice: number;
    customerName?: string;
    customerPhone?: string;
    createdAt: string;
}

export interface CreateSaleData {
  productId: string;
  quantity: number;
  price: number;
  customerName?: string;
  customerPhone?: string;
}