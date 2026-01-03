import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { AnalyticInventoryData } from "@/interface/analytic.type";

export const useAnalytics = () => {
	return useQuery<AnalyticInventoryData>({
		queryKey: ["analytics"],
		queryFn: async () => {
			const { data } = await api.get("/analytics");
			return data;
		},
	});
};
