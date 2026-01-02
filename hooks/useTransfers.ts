import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Transfer, CreateTransferData } from "@/interface/transfer.type";

export const useTransfers = () => {
  return useQuery<{ transfers: Transfer[] }>({
    queryKey: ["transfers"],
    queryFn: async () => {
      const { data } = await api.get("/transfers");
      return data;
    },
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transferData: CreateTransferData) => {
      const { data } = await api.post("/transfers", transferData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};

export const useUpdateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data } = await api.put(`/transfers/${id}`, { quantity });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};

export const useReturnTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/transfers/${id}/return`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};
