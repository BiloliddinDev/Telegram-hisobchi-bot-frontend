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

export interface KassaData {
  balance: number;
  totalIn: number;
  totalOut: number;
}

export interface CashTransaction {
  _id: string;
  type: "in" | "out" | "rashot" | "oylik";
  amount: number;
  description: string;
  performedBy: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  relatedSeller?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  relatedSale?: string;
  createdAt: string;
}

export interface CashBalanceResponse {
  balance: number;
  totalIn: number;
  totalOut: number;
  adminPocket: number;
  countIn: number;
  countOut: number;
}

export interface CashTransactionsResponse {
  transactions: CashTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
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
  kassa: KassaData;
}
