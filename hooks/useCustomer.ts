import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { CustomerDetailResponse } from "@/interface/customer";

export const useCustomerDetail = (id: string) => {
  return useQuery<CustomerDetailResponse>({
    queryKey: ["customer-detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/customers/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useAcceptPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      amount,
      notes,
    }: {
      id: string;
      amount: number;
      notes?: string;
    }) => {
      const { data } = await api.post(`/customers/${id}/payment`, {
        amount,
        notes,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-detail"] });
      queryClient.invalidateQueries({ queryKey: ["seller-sales-history"] });
    },
  });
};
