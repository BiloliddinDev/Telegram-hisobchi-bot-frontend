import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Product } from "@/interface/products.type";
import { Sale } from "@/interface/sale.type";
import { Report } from "@/interface/report.type";

export const useSellerProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["seller-products"],
    queryFn: async () => {
      const { data } = await api.get("/seller/products");
      return data.products;
    },
  });
};

export const useSellerSales = () => {
  return useQuery<Sale[]>({
    queryKey: ["seller-sales"],
    queryFn: async () => {
      const { data } = await api.get("/seller/sales");
      return data.sales;
    },
  });
};

export const useSellerReports = () => {
  return useQuery<Report>({
    queryKey: ["seller-reports"],
    queryFn: async () => {
      const { data } = await api.get("/seller/reports");
      return data;
    },
  });
};
