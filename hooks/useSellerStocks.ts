import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {SellerStocksResponse} from "@/interface/seller-stock.type";
import api from "@/lib/api";

export const useSellerStocks = (sellerId: string) => {
    return useQuery<SellerStocksResponse>({
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
        mutationFn: async ({ stockId, quantity }: { stockId: string; quantity: number }) => {
            const { data } = await api.patch(`/admin/seller-stocks/${stockId}`, { quantity });
            return data;
        },
        onSuccess: () => {
            // Ma'lumot yangilangandan keyin jadvalni qayta yuklash
            queryClient.invalidateQueries({ queryKey: ["sellerStocks"] });
        },
    });
};