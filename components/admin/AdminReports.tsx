"use client";

import React, { useState } from "react";
import { useExportExcel } from "@/hooks/useAdminData";
import { useReports } from "@/hooks/useAnalytics";
import { useToast } from "@/hooks/useToast";
import {
  Download,
  Package,
  TrendingUp,
  BarChart3,
  ShoppingCart,
  Calendar as CalendarIcon,
  AlertCircle,
  Banknote,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ReportData, SellerDebt } from "@/interface/analytic.type";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { cn } from "@/lib/utils";

const formatDateAPI = (date: Date): string => date.toISOString().split("T")[0];

interface MetricItem {
  label: string;
  value: number;
  isPrice?: boolean;
  isRed?: boolean;
  isGreen?: boolean;
}

interface AnalyticCardProps {
  title: string;
  metrics: MetricItem[];
  icon: React.ReactNode;
  highlight?: "red" | "green";
}

export default function AdminReports() {
  const { showToast } = useToast();
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { data: reports, isLoading: reportsLoading } = useReports(
    formatDateAPI(startDate),
    formatDateAPI(endDate),
  ) as { data: ReportData | undefined; isLoading: boolean };

  const { mutate: exportExcel, isPending: isExporting } = useExportExcel();

  if (reportsLoading) return <ReportsSkeleton />;

  const products = reports?.summary.products;
  const sellerStocks = reports?.summary.sellerStocks;
  const sales = reports?.summary.sales;
  const debts = reports?.debts;

  const profit = sales?.totalProfit || 0;
  const totalPaid = sales?.totalPaid || 0;
  const totalRevenue = sales?.totalRevenue || 0;
  const margin =
    totalRevenue > 0 ? ((profit / totalPaid) * 100).toFixed(1) : "0";

  const chartData = [
    { name: "Asosiy Ombor", value: products?.totalProductCostPrice || 0 },
    {
      name: "Sotuvchilarda",
      value: sellerStocks?.totalSellerStockCostPrice || 0,
    },
    { name: "Jami Savdo", value: totalRevenue },
    { name: "Naqd Tushum", value: totalPaid },
    { name: "Jami Qarz", value: debts?.grandTotalDebt || 0 },
  ];

  const handleExportExcel = () => {
    exportExcel(undefined, {
      onSuccess: (response) => {
        const blob = new Blob([response as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const fileName = `Hisobot_${format(new Date(), "dd-MM-yyyy_HH-mm")}.xlsx`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast("Hisobot muvaffaqiyatli yuklandi", "success");
      },
      onError: (error) => {
        console.error("Export error:", error);
        showToast("Faylni yuklashda xatolik yuz berdi", "error");
      },
    });
  };

  return (
    <TabsContent
      value="reports"
      className="mt-6 space-y-6 outline-none animate-in fade-in duration-500"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border rounded-xl shadow-sm gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-800 uppercase">
            <BarChart3 className="h-5 w-5" /> Analitika Markazi
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
            Davr: {format(startDate, "dd.MM.yyyy")} —{" "}
            {format(endDate, "dd.MM.yyyy")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border rounded-lg p-1">
            <DatePickerResponsive
              date={startDate}
              setDate={(d) => d && setStartDate(d)}
              label="Dan"
            />
            <span className="text-slate-300">—</span>
            <DatePickerResponsive
              date={endDate}
              setDate={(d) => d && setEndDate(d)}
              label="Gacha"
              minDate={startDate}
            />
          </div>
          <Button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="gap-2 font-black border-slate-900 uppercase text-[10px] rounded-lg"
          >
            {isExporting ? (
              <div className="h-3 w-3 animate-spin border-2 border-slate-900 border-t-transparent rounded-full" />
            ) : (
              <Download size={14} />
            )}
            Eksport
          </Button>
        </div>
      </div>

      {/* Profit Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-lg border border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-[50px]" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/10 blur-[50px]" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
              Umumiy Sof Foyda
            </p>
            <h2 className="text-5xl font-black tracking-tighter">
              {profit.toLocaleString()}{" "}
              <span className="text-2xl text-slate-500">$</span>
            </h2>
            <p className="text-[10px] text-slate-500 mt-2">
              {` Faqat to'langan puldan hisoblangan`}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-10">
            <div className="h-10 w-[1px] bg-slate-800 hidden md:block" />
            {/* Jami sotuv */}
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                Jami Sotuv
              </p>
              <p className="text-xl font-bold text-white">
                {totalRevenue.toLocaleString()} $
              </p>
              <p className="text-[10px] text-slate-600">Qarz + Naqd</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-800 hidden md:block" />
            {/* Naqd tushum */}
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-400 mb-1">
                Naqd Tushum
              </p>
              <p className="text-xl font-bold text-emerald-400">
                {totalPaid.toLocaleString()} $
              </p>
              <p className="text-[10px] text-slate-600">{`Qo'ldagi pul`}</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-800 hidden md:block" />
            {/* Sotilgan tovar */}
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                Sotilgan tovar
              </p>
              <p className="text-xl font-bold text-white">
                {sales?.totalSalesQuantity?.toLocaleString()} dona
              </p>
            </div>
            <div className="h-10 w-[1px] bg-slate-800 hidden md:block" />
            {/* Qarz */}
            <div>
              <p className="text-[10px] font-bold uppercase text-red-400 mb-1">
                Jami Qarz
              </p>
              <p className="text-xl font-bold text-red-400">
                {debts?.grandTotalDebt?.toLocaleString()} $
              </p>
              <p className="text-[10px] text-slate-600">Hali olinmagan</p>
            </div>
          </div>
        </div>
        <div className="mt-8 h-1 w-full rounded-full bg-slate-800/50">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
            style={{ width: `${Math.min(Number(margin), 100)}%` }}
          />
        </div>
      </div>

      {/* 5 ta karta */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <AnalyticCard
          title="Asosiy Ombor"
          icon={<Package size={18} />}
          metrics={[
            { label: "Mahsulot turi", value: products?.totalProducts || 0 },
            { label: "Jami dona", value: products?.totalProductQuantity || 0 },
            {
              label: "Umumiy qiymat",
              value: products?.totalProductCostPrice || 0,
              isPrice: true,
            },
          ]}
        />
        <AnalyticCard
          title="Sotuvchilarda"
          icon={<ShoppingCart size={18} />}
          metrics={[
            {
              label: "Mahsulot turi",
              value: sellerStocks?.totalSellerStocks || 0,
            },
            {
              label: "Jami dona",
              value: sellerStocks?.totalSellerStockQuantity || 0,
            },
            {
              label: "Umumiy qiymat",
              value: sellerStocks?.totalSellerStockCostPrice || 0,
              isPrice: true,
            },
          ]}
        />
        <AnalyticCard
          title="Savdo Hisoboti"
          icon={<TrendingUp size={18} />}
          metrics={[
            { label: "Sotilgan tur", value: sales?.totalProductsSold || 0 },
            { label: "Sotilgan dona", value: sales?.totalSalesQuantity || 0 },
            { label: "Jami sotuv", value: totalRevenue, isPrice: true },
          ]}
        />
        <AnalyticCard
          title="Naqd Tushum"
          icon={<Banknote size={18} />}
          highlight="green"
          metrics={[
            {
              label: "To'langan",
              value: totalPaid,
              isPrice: true,
              isGreen: true,
            },
            { label: "Sof foyda", value: profit, isPrice: true, isGreen: true },
            { label: "Margin", value: Number(margin) },
          ]}
        />
        <AnalyticCard
          title="Qarzlar"
          icon={<AlertCircle size={18} />}
          highlight="red"
          metrics={[
            { label: "Qarzdor mijozlar", value: debts?.totalDebtors || 0 },
            {
              label: "Sotuvchilar soni",
              value: debts?.sellerDebts?.length || 0,
            },
            {
              label: "Jami qarz",
              value: debts?.grandTotalDebt || 0,
              isPrice: true,
              isRed: true,
            },
          ]}
        />
      </div>

      {/* Seller bo'yicha qarzlar */}
      {(debts?.sellerDebts?.length || 0) > 0 && (
        <Card className="border border-red-100 shadow-none bg-white rounded-xl overflow-hidden">
          <CardHeader className="border-b border-red-50 bg-red-50/50">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
              <AlertCircle size={14} />
              {` Sotuvchilar bo'yicha qarzlar`}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 divide-y divide-slate-50">
            {debts?.sellerDebts?.map((s: SellerDebt) => (
              <div
                key={s.seller._id}
                className="flex justify-between items-center py-3"
              >
                <div>
                  <p className="text-[12px] font-black text-slate-800">
                    {s.seller.firstName} {s.seller.lastName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {s.customersCount} ta qarzdor mijoz
                  </p>
                </div>
                <span className="font-black text-red-500 text-lg">
                  {s.totalDebt.toLocaleString()} $
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      <Card className="border border-slate-200 shadow-none bg-white rounded-xl overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
          <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {`Moliyaviy ko'rsatkichlar tahlili ($)`}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[380px] w-full pt-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#cbd5e1" }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "none",
                }}
                formatter={(value: number) => [
                  `${value.toLocaleString()} $`,
                  "Summa",
                ]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={45}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "Jami Qarz"
                        ? "#ef4444"
                        : entry.name === "Naqd Tushum"
                          ? "#10b981"
                          : "#0f172a"
                    }
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function AnalyticCard({ title, metrics, icon, highlight }: AnalyticCardProps) {
  return (
    <Card
      className={cn(
        "border shadow-none rounded-xl bg-white overflow-hidden transition-colors",
        highlight === "red"
          ? "border-red-200 hover:border-red-400"
          : highlight === "green"
            ? "border-emerald-200 hover:border-emerald-400"
            : "border-slate-200 hover:border-slate-400",
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between pb-3 border-b",
          highlight === "red"
            ? "border-red-50 bg-red-50/30"
            : highlight === "green"
              ? "border-emerald-50 bg-emerald-50/30"
              : "border-slate-50",
        )}
      >
        <CardTitle
          className={cn(
            "text-[11px] font-bold uppercase tracking-widest",
            highlight === "red"
              ? "text-red-400"
              : highlight === "green"
                ? "text-emerald-500"
                : "text-slate-400",
          )}
        >
          {title}
        </CardTitle>
        <div
          className={
            highlight === "red"
              ? "text-red-400"
              : highlight === "green"
                ? "text-emerald-500"
                : "text-slate-400"
          }
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        {metrics.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex justify-between items-center",
              i !== metrics.length - 1 && "pb-3 border-b border-slate-50",
            )}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              {m.label}
            </span>
            <span
              className={cn(
                "font-black tracking-tight",
                m.isRed
                  ? "text-red-500"
                  : m.isGreen
                    ? "text-emerald-500"
                    : "text-slate-900",
                m.isPrice ? "text-lg" : "text-base",
              )}
            >
              {m.value.toLocaleString()} {m.isPrice ? "$" : ""}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DatePickerResponsive({
  date,
  setDate,
  label,
  minDate,
}: {
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
  label: string;
  minDate?: Date;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-[11px] font-bold text-slate-600 hover:bg-white rounded-md"
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-300 mr-1">{label}:</span>
          {date ? format(date, "dd MMM", { locale: uz }) : "Tanlang"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border border-slate-200 shadow-xl z-50 rounded-xl overflow-hidden">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(d) => (minDate ? d < minDate : false) || d > new Date()}
          className="bg-white"
        />
      </PopoverContent>
    </Popover>
  );
}

function ReportsSkeleton() {
  return (
    <div className="mt-6 space-y-6 animate-pulse">
      <div className="h-20 bg-slate-50 rounded-xl" />
      <div className="h-48 bg-slate-50 rounded-xl" />
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-44 bg-slate-50 rounded-xl" />
        ))}
      </div>
      <div className="h-24 bg-slate-50 rounded-xl" />
      <div className="h-80 bg-slate-50 rounded-xl" />
    </div>
  );
}
