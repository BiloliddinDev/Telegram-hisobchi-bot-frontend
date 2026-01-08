import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { CreateSalePayload } from "@/interface/sale.type";

export const useSellerSales = () => {
  return useQuery({
    queryKey: ["seller-sales"],
    queryFn: async () => {
      const { data } = await api.get("/sales/my-sales");
      return data.sales;
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (saleData: CreateSalePayload) => {
      const { data } = await api.post("/sales", saleData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-sales"] });
      queryClient.invalidateQueries({ queryKey: ["me"] }); 
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.user;
    },
  });
};
