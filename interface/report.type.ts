import {Product} from "@/interface/products.type";
import {Sale} from "@/interface/sale.type";

export interface Report {
    summary: {
        totalSales: number;
        totalRevenue: number;
        totalProducts: number;
        totalUsers: number;
        totalQuantity: number;
    };

    salesByCategory: Record<string, number>;
    topProducts: Product[];
    recentSales: Sale[];
}
