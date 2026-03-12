export interface SellerDebt {
  seller: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  totalDebt: number;
  customersCount: number;
  customers: {
    _id: string;
    name: string;
    phone: string;
    totalDebt: number;
    lastPurchase: string;
  }[];
}

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
      totalProfit: number;
      totalDebt: number;
      totalPaid: number;
      debtRatio: string;
      totalSalesQuantity: number;
      totalSellers: number;
      totalProductsSold: number;
      averageSaleAmount: number;
    };
  };
  debts: {
    grandTotalDebt: number;
    totalDebtors: number;
    sellerDebts: SellerDebt[];
  };
}
