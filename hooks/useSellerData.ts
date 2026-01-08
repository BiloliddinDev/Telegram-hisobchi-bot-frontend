import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {ActiveAssignedStocksWithSummaryResponse, SellerDetailResponse} from "@/interface/seller-stock.type";
import { Sale, CreateSalePayload } from "@/interface/sale.type";
import { User } from "@/interface/User.type";

export const useSellerStocks = () => {
  return useQuery<ActiveAssignedStocksWithSummaryResponse>({
    queryKey: ["seller-stocks"],
    queryFn: async () => {
      const { data } = await api.get("/seller/stocks");
      return data;
    },
  });
};

export const useSellerSalesHistory = () => {
  return useQuery<Sale[]>({
    queryKey: ["seller-sales-history"],
    queryFn: async () => {
      const { data } = await api.get("/sales");
      return data.sales;
    },
  });
};

export const useProcessSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSalePayload) => {
      const { data } = await api.post("/sales", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-stocks"] });
      queryClient.invalidateQueries({ queryKey: ["seller-sales-history"] });
    },
  });
};

export const useSellerDetail = (id: string) => {
  return useQuery<{ seller: User }>({
    queryKey: ["seller", id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/sellers/${id}`);
      return data;
    },
    enabled: !!id,
  });
};



export const useSellerDetailHistory = (sellerId: string) => {
  return useQuery({
    queryKey: ["seller-detail", sellerId],
    queryFn: async () => {
      const { data } = await api.get<SellerDetailResponse>(`/sellers/${sellerId}/sales`);
      return data;
    },
    enabled: !!sellerId, 
  });
};
