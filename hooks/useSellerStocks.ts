import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActiveAssignedStocksResponse } from "@/interface/seller-stock.type";
import api from "@/lib/api";

export const useSellerStocks = (sellerId: string) => {
  return useQuery<ActiveAssignedStocksResponse>({
    queryKey: ["sellerStocks", sellerId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/sellers/${sellerId}/stocks`);
      return data;
    },
    enabled: !!sellerId,
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stockId,

      quantity,
    }: {
      stockId: string;
      quantity: number;
    }) => {
      const { data } = await api.patch(`/admin/seller-stocks/${stockId}`, {
        quantity,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerStocks"] });
    },
  });
};

export const useRemoveSellerStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stockId: string) => {
      const { data } = await api.delete(
        `/admin/seller-stocks/${stockId}?unassign=true`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerStocks"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
