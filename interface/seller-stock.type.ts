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
  product: {
    name : string;
    sku: string;
  };
  quantity: number;
  price: number;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  timestamp: string;
  createdAt: string;
}

export interface SellerOrderItem {
  saleId: string;
  product: {
    _id?: string;
    name: string;
    sku: string;
  };
  quantity: number;
  price: number;
  costPrice: number;
  totalAmount: number;
  status?: string;
}

export interface SellerOrder {
  orderId: string;
  isCustomer: boolean;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  timestamp: string;
  items: SellerOrderItem[];
  totalAmount: number;
  rawTotal: number;
  discountPercent: number;
  debt: number;
  paidAmount: number;
  status: string;
  dueDate?: string;
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
  sales: SellerOrder[];
  stats: {
    totalSales: number;
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    totalDebt: number;
    totalPaid: number;
    warehouseStockValue: number;
    sellerStockValue: number;
  };
  message?: string;
}