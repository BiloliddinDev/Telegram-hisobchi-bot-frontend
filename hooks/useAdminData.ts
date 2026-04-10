import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { User } from "@/interface/User.type";
import { ActiveAssignedStocksResponse } from "@/interface/seller-stock.type";
import {
  CashBalanceResponse,
  CashTransactionsResponse,
} from "@/interface/analytic.type";

export const useSellers = () => {
  return useQuery<User[]>({
    queryKey: ["sellers"],
    queryFn: async () => {
      const { data } = await api.get("/admin/sellers");
      return data.sellers;
    },
  });
};

export const useCreateSeller = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sellerData: Partial<User>) => {
      const { data } = await api.post("/admin/sellers", sellerData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });
};

export const useUpdateSeller = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await api.put(`/admin/sellers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });
};

export const useDeleteSeller = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/sellers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });
};

export const useAssignProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sellerId,
      productId,
      quantity,
    }: {
      sellerId: string;
      productId: string;
      quantity: number;
    }) => {
      const { data } = await api.post(
        `/admin/sellers/${sellerId}/products/${productId}`,
        { quantity },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useExportExcel = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get('/export/database?format=xlsx&download=true', {
        responseType: 'blob',
      });
      return data;
    },
  });
};

// === KASSA HOOKS ===

export const useCashBalance = (start?: string, end?: string) => {
  return useQuery<CashBalanceResponse>({
    queryKey: ["cash-balance", start, end],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (start) params.append("start", start);
      if (end) params.append("end", end);
      const { data } = await api.get(
        `/admin/cash/balance?${params.toString()}`,
      );
      return data;
    },
  });
};

export const useCashTransactions = (
  start?: string,
  end?: string,
  type?: string,
  page: number = 1,
) => {
  return useQuery<CashTransactionsResponse>({
    queryKey: ["cash-transactions", start, end, type, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (start) params.append("start", start);
      if (end) params.append("end", end);
      if (type) params.append("type", type);
      params.append("page", String(page));
      params.append("limit", "20");
      const { data } = await api.get(
        `/admin/cash/transactions?${params.toString()}`,
      );
      return data;
    },
  });
};

export const useCashWithdraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { amount: number; description: string }) => {
      const { data } = await api.post("/admin/cash/withdraw", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-balance"] });
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
};

export const useCashSpend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      amount: number;
      type: "rashot" | "oylik";
      description?: string;
      sellerId?: string;
    }) => {
      const { data } = await api.post("/admin/cash/spend", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-balance"] });
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
    },
  });
};

export const useDeleteCashTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/cash/transactions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-balance"] });
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
};

export const useSellerStocks = (sellerId: string) => {
  return useQuery<ActiveAssignedStocksResponse>({
    queryKey: ["seller-stocks", sellerId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/sellers/${sellerId}/stocks`);
      return data;
    },
    enabled: !!sellerId,
  });
};
