import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { SellerAnalytics } from "@/interface/seller.type";

export interface AnalyticsData {
  summary: {
    totalInventoryValue: number;
    warehouseStockValue: number;
    sellerStockValue: number;
  };
  sellers: SellerAnalytics[];
}

export const useAnalytics = () => {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data } = await api.get("/analytics");
      return data;
    },
  });
};
