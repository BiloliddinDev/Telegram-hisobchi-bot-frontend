import { useQuery } from "@tanstack/react-query";
import { ReportData} from "@/interface/analytic.type";
import api from "@/lib/api";


export const useReports = (start: string, end: string) => {
	return useQuery({
		queryKey: ["admin-reports", start, end],
		queryFn: async () => {
			const { data } = await api.get(`/admin/reports`, {
				params: { start, end }
			});
			return data as ReportData;
		},
		enabled: !!start && !!end,
	});
};