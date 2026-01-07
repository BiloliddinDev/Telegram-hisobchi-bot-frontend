import { Product } from "@/interface/products.type";

export interface Report {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSales: number;
    totalRevenue: string; // Swaggerda string ekan
    totalQuantity: number;
    totalSellers: number;
    totalProducts: number;
    averageSaleAmount: string;
  };
  salesBySeller: SalesBySellerType[];
  salesByProduct: SalesByProductType[];
  topPerformers: TopPerformers; // Swaggerdagi yangi ob'ekt
  dailySales: DailySalesType[];
}

// 1. Eng yaxshi natijalar
interface TopPerformers {
  topSellerByRevenue: {
    seller: FullUser;
    totalRevenue: number; // Swaggerda bu yerda number
    totalSales: number;
  };
  topProductByQuantity: {
    product: Product;
    totalQuantity: number;
    totalSales: number;
  };
}

// 2. To'liq foydalanuvchi ma'lumotlari (Role va AssignedProducts bilan)
interface FullUser {
  _id: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: "admin" | "seller";
  assignedProducts: Product[];
  isActive: boolean;
}

// 3. Sotuvchi statistikasi
interface SalesBySellerType {
  seller: {
    id: string; // Swaggerda string ekan
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  stats: {
    totalSales: number;
    totalRevenue: string;
    totalQuantity: number;
    averageSaleAmount: string;
  };
}

// 4. Mahsulot statistikasi
interface SalesByProductType {
  product: {
    id: string;
    name: string;
    price: string;
  };
  stats: {
    totalSales: number;
    totalRevenue: string;
    totalQuantity: number;
    averageSaleAmount: string;
  };
}

// 5. Kunlik sotuvlar
interface DailySalesType {
  date: string;
  totalSales: number;
  totalRevenue: string;
  totalQuantity: number;
}
