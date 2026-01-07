import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { User } from "@/interface/User.type";
import { Report } from "@/interface/report.type";
import {SellerStocksResponse} from "@/interface/seller-stock.type";

export const useSellers = () => {
  return useQuery<User[]>({
    queryKey: ["sellers"],
    queryFn: async () => {
      const { data } = await api.get("/admin/sellers");
      return data.sellers;
    },
  });
};

export const useReports = (start: string, end: string) => {
  return useQuery<Report>({
    queryKey: ["reports", start, end],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (start) params.append("start", start);
      if (end) params.append("end", end);
      const { data } = await api.get(`/admin/reports?${params.toString()}`);
      console.log(data, "This is Filtered Report data");
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
      const response = await api.get("/admin/export-excel", {
        responseType: "blob",
      });
      return response.data;
    },
  });
};



