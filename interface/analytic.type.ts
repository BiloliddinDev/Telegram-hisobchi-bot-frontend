export interface ReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    products: {
      totalProducts: number;
      totalProductQuantity: number;
      totalProductCostPrice: number;
    };
    sellerStocks: {
      totalSellerStocks: number;
      totalSellerStockQuantity: number;
      totalSellerStockCostPrice: number;
    };
    sales: {
      totalSales: number;
      totalRevenue: number;
      totalSalesQuantity: number;
      totalSellers: number;
      totalProductsSold: number;
      averageSaleAmount: number;
    };
  };
}