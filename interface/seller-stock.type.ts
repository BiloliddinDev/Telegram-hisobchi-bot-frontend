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

export interface SellerStockDetail {
  _id: string;
  product: Product;
  seller: string;
  quantity: number;
  lastTransferDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerStocksResponse {
  sellerStocks: SellerStockDetail[];
}

export interface Stock {
  _id: string;
  quantity: number;
  lastTransferDate?: string;
  updatedAt?: string;
  createdAt?: string;
}

// New interface for detailed stock with product assignment info
export interface ProductStockItem {
  sellerProductId: string;
  product: Product;
  assignment: {
    isActive: boolean;
    assignAt: string;
    unassignAt?: string;
  };
  stock: Stock;
}

export interface ActiveAssignedStocksWithSummaryResponse {
  sellerStocks: ProductStockItem[];
  summary: {
    totalProducts: number;
    totalQuantity: number;
    totalStockValue: number;
  };
}

export interface ActiveAssignedStocksResponse {
  sellerStocks: ProductStockItem[];
}


export interface SaleRecord {
  _id: string;
  seller: string;
  product: string; // Agar backend populate qilmasa string keladi
  quantity: number;
  price: number;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  timestamp: string;
  createdAt: string;
}

export interface Seller {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}


export interface SellerDetailResponse {
  sales:  SaleRecord[];
  stats: {
    totalSalesAmount: number;
    totalQuantity: number;
    count: number;
  };
  message?: string;
}