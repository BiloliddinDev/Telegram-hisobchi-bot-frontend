import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { User } from "@/interface/User.type";
import { Seller } from "@/interface/seller.type";
import { Report } from "@/interface/report.type";

export const useSellers = () => {
  return useQuery<Seller[]>({
    queryKey: ["sellers"],
    queryFn: async () => {
      const { data } = await api.get("/admin/sellers");
      return data.sellers;
    },
  });
};

export const useReports = () => {
  return useQuery<Report>({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data } = await api.get("/admin/reports/monthly");
      return data;
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
    mutationFn: async ({ sellerId, productId, quantity }: { sellerId: string; productId: string; quantity: number }) => {
      const { data } = await api.post(`/admin/sellers/${sellerId}/products/${productId}`, { quantity });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
