import { Product } from "@/interface/products.type";

export interface AnalyticInventoryData {
  summary: {
    totalInventoryValue: number; // Umumiy tovar qiymati
    warehouseStockValue: number; // Asosiy ombordagi tovar qiymati
    sellerStockValue: number; // Sotuvchilar qo'lidagi tovar qiymati
  };
  sellers: InventorySeller[];
  sales: InventorySale[];
}

export interface InventorySeller {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  telegramId: string;
  totalValue: number; // Shu sotuvchidagi tovarlarning umumiy summasi
  productCount: number; // Shu sotuvchidagi mahsulotlar soni
}

interface InventorySale {
  _id: string;
  sellerId: {
    _id: string;
    telegramId: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: "admin" | "seller";
    assignedProducts: Product[]; // Batafsil Product interface dan foydalanish mumkin
    isActive: boolean;
  };
  productId: Product;
  quantity: number;
  price: number;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  notes: string;
  timestamp: string;
}
