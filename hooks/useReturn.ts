import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ReturnPayload, ReturnResponse } from "@/interface/return.type";

export const useReturn = () => {
  const queryClient = useQueryClient();
  return useMutation<ReturnResponse, Error, ReturnPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/sales/return", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-sales-history"] });
      queryClient.invalidateQueries({ queryKey: ["seller-stocks"] });
      queryClient.invalidateQueries({ queryKey: ["seller-customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};
