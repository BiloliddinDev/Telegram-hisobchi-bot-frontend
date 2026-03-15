import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  ActiveAssignedStocksWithSummaryResponse,
  SellerDetailResponse,
} from "@/interface/seller-stock.type";
import { CreateSalePayload } from "@/interface/sale.type";
import { User } from "@/interface/User.type";
import { GroupedOrder } from "@/interface/sale.type";

export const useSellerStocks = () => {
  return useQuery<ActiveAssignedStocksWithSummaryResponse>({
    queryKey: ["seller-stocks"],
    queryFn: async () => {
      const { data } = await api.get("/seller/stocks");
      return data;
    },
  });
};

export const useSellerSalesHistory = (start?: string, end?: string) => {
  return useQuery<GroupedOrder[]>({
    queryKey: ["seller-sales-history", start, end],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (start) params.start = start;
      if (end) params.end = end;
      const { data } = await api.get("/seller/sales", { params });
      return data.sales;
    },
  });
};

export const useProcessSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSalePayload) => {
      const { data } = await api.post("/sales/batch", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-stocks"] });
      queryClient.invalidateQueries({ queryKey: ["seller-customers"] });
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

export const useSellerDetailHistory = (
  sellerId: string,
  start?: string,
  end?: string,
) => {
  return useQuery<SellerDetailResponse>({
    queryKey: ["seller-detail", sellerId, start, end],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (start) params.start = start;
      if (end) params.end = end;
      const { data } = await api.get<SellerDetailResponse>(
        `/admin/sellers/${sellerId}/sales`,
        { params },
      );
      return data;
    },
    enabled: !!sellerId,
  });
};

export const useSellerCustomers = () => {
  return useQuery({
    queryKey: ["seller-customers"],
    queryFn: async () => {
      const { data } = await api.get("/customers");
      return data.customers;
    },
  });
};
