// "use client";

// import { useState, useMemo } from "react";
// import { useExportExcel, useReports } from "@/hooks/useAdminData";
// import { useAnalytics } from "@/hooks/useAnalytics";
// import { useToast } from "@/hooks/useToast";
// import {
//   Download,
//   Package,
//   TrendingUp,
//   ShoppingCart,
//   Calendar,
//   History,
//   Award,
//   BarChart3,
//   PieChartIcon,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { TabsContent } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";

// import {
//   AnalyticInventoryData,
//   InventorySeller,
// } from "@/interface/analytic.type";
// import { Report } from "@/interface/report.type";

// const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// export default function AdminReports() {
//   const { showToast } = useToast();
//   const [filterYear, setFilterYear] = useState<string>("2026");
//   const [filterMonth, setFilterMonth] = useState<string>("all");

//   const { data: reports, isLoading: reportsLoading } = useReports(
//     filterYear,
//     filterMonth,
//   ) as { data: Report; isLoading: boolean };
//   const { data: analytics, isLoading: analyticsLoading } = useAnalytics() as {
//     data: AnalyticInventoryData;
//     isLoading: boolean;
//   };

//   const { mutate: exportExcel, isPending: isExporting } = useExportExcel();

//   const handleExportExcel = () => {
//     exportExcel(undefined, {
//       onSuccess: (blob) => {
//         const url = window.URL.createObjectURL(new Blob([blob]));
//         const link = document.createElement("a");
//         link.href = url;
//         const date = new Date().toISOString().split("T")[0];
//         link.setAttribute("download", `Hisobot_${date}.xlsx`);
//         document.body.appendChild(link);
//         link.click();
//         link.remove();
//         window.URL.revokeObjectURL(url);
//         showToast("Excel hisobot muvaffaqiyatli yuklandi", "success");
//       },
//       onError: () => showToast("Excel yuklashda xatolik yuz berdi", "error"),
//     });
//   };

//   const pieData = useMemo(
//     () =>
//       analytics
//         ? [
//             {
//               name: "Asosiy Ombor",
//               value: analytics.summary.warehouseStockValue,
//             },
//             {
//               name: "Sotuvchilardagi",
//               value: analytics.summary.sellerStockValue,
//             },
//           ]
//         : [],
//     [analytics],
//   );

//   const barData = useMemo(
//     () =>
//       analytics
//         ? analytics.sellers.map((s: InventorySeller) => ({
//             name: s.firstName || s.username,
//             value: s.totalValue,
//           }))
//         : [],
//     [analytics],
//   );

//   if (reportsLoading || analyticsLoading) return <ReportsSkeleton />;

//   return (
//     <TabsContent value="reports" className="mt-4 space-y-8">
//       {/* 1. Header & Pro Filters */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
//         <div className="space-y-1">
//           <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
//             <BarChart3 className="h-6 w-6 " /> Analitika Markazi
//           </h2>
//           <p className="text-muted-foreground text-sm font-medium">
//             Ombor va sotuvlar monitoringi
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
//           <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
//             <Calendar className="h-4 w-4 text-gray-500 ml-2" />
//             <Select value={filterYear} onValueChange={setFilterYear}>
//               <SelectTrigger className="w-[90px] h-8 border-none bg-transparent shadow-none focus:ring-0 font-semibold">
//                 <SelectValue placeholder="Yil" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="2026">2026</SelectItem>
//                 <SelectItem value="2027">2027</SelectItem>
//                 <SelectItem value="2028">2028</SelectItem>
//               </SelectContent>
//             </Select>
//             <Select value={filterMonth} onValueChange={setFilterMonth}>
//               <SelectTrigger className="w-[110px] h-8 border-none bg-transparent shadow-none focus:ring-0 font-semibold ">
//                 <SelectValue placeholder="Oy" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">Barcha oylar</SelectItem>
//                 <SelectItem value="1">Yanvar</SelectItem>
//                 <SelectItem value="2">Fevral</SelectItem>
//                 <SelectItem value="3">Mart</SelectItem>
//                 <SelectItem value="4">Aprel</SelectItem>
//                 <SelectItem value="5">May</SelectItem>
//                 <SelectItem value="6">Iyun</SelectItem>
//                 <SelectItem value="7">Iyul</SelectItem>
//                 <SelectItem value="8">Avgust</SelectItem>
//                 <SelectItem value="9">Sentabr</SelectItem>
//                 <SelectItem value="10">Oktabr</SelectItem>
//                 <SelectItem value="11">Noyabr</SelectItem>
//                 <SelectItem value="12">Dekabr</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <Button
//             onClick={handleExportExcel}
//             disabled={isExporting}
//             className="text-white rounded-xl px-5 h-11 gap-2 transition-all active:scale-95 shadow-md"
//           >
//             {isExporting ? (
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//             ) : (
//               <Download className="h-4 w-4" />
//             )}
//             Excel Hisobot
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatItem
//           title="Umumiy Tovar"
//           value={reports?.summary?.totalProducts || 0}
//           icon={<Package className="text-orange-500" />}
//           desc="Ombordagi turlar"
//           unit="ta"
//         />
//         <StatItem
//           title="Ombor Qiymati"
//           value={analytics?.summary?.warehouseStockValue || 0}
//           icon={<TrendingUp className="text-emerald-500" />}
//           desc="Toza qoldiq"
//           isPrice
//         />
//         <StatItem
//           title="Sotuvchilarda"
//           value={analytics?.summary?.sellerStockValue || 0}
//           icon={<ShoppingCart className="text-blue-500" />}
//           desc="Aylanma summasi"
//           isPrice
//         />
//         <StatItem
//           title="Oylik Tushum"
//           value={Number(reports?.summary?.totalRevenue) || 0}
//           icon={<Award className="text-purple-500" />}
//           desc="Savdo hajmi"
//           isPrice
//         />
//       </div>

//       {/* 3. Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <div>
//               <CardTitle className="text-base font-bold text-gray-800">
//                 Sotuvchilar Balansi
//               </CardTitle>
//               <CardDescription>{`Joriy tovarlar summasi (so'mda)`}</CardDescription>
//             </div>
//             <BarChart3 className="h-5 w-5 text-gray-400" />
//           </CardHeader>
//           <CardContent className="h-[300px] pt-4">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={barData}>
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   vertical={false}
//                   stroke="#f3f4f6"
//                 />
//                 <XAxis
//                   dataKey="name"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 12, fill: "#6b7280" }}
//                 />
//                 <YAxis hide />
//                 <RechartsTooltip
//                   cursor={{ fill: "#f9fafb" }}
//                   contentStyle={{
//                     borderRadius: "12px",
//                     border: "none",
//                     boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
//                   }}
//                   formatter={(val: number) => [
//                     `${val.toLocaleString()} so'm`,
//                     "Summa",
//                   ]}
//                 />
//                 <Bar
//                   dataKey="value"
//                   fill="#3b82f6"
//                   radius={[6, 6, 0, 0]}
//                   barSize={32}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         <Card className="border-none shadow-sm bg-white overflow-hidden">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-base font-bold text-gray-800 tracking-tight flex items-center gap-2">
//               <PieChartIcon className="h-4 w-4" /> Resurs Taqsimoti
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="h-[300px] flex flex-col justify-center">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   innerRadius={70}
//                   outerRadius={95}
//                   paddingAngle={5}
//                   dataKey="value"
//                 >
//                   {pieData.map((_, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={COLORS[index % COLORS.length]}
//                     />
//                   ))}
//                 </Pie>
//                 <RechartsTooltip
//                   formatter={(val: number) => `${val.toLocaleString()} so'm`}
//                 />
//                 <Legend iconType="circle" />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* 4. Individual Seller History (Accordion) */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between px-2">
//           <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 italic">
//             <History className="h-5 w-5 " /> Sotuvchilar Tarixi va Qoldiqlari
//           </h3>
//           <div className="bg-blue-50  px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">
//             {analytics?.sellers.length || 0} ta aktiv sotuvchi
//           </div>
//         </div>

//         <div className="grid gap-4">
//           {analytics?.sellers.map((seller: InventorySeller) => (
//             <Card
//               key={seller._id}
//               className="border border-gray-100 shadow-sm hover:border-blue-200 transition-all rounded-2xl overflow-hidden bg-white"
//             >
//               <Accordion type="single" collapsible>
//                 <AccordionItem value={seller._id} className="border-none">
//                   <AccordionTrigger className="px-6 py-4 hover:no-underline group">
//                     <div className="flex justify-between items-center w-full pr-4 text-left">
//                       <div className="flex items-center gap-4">
//                         <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg">
//                           {seller.firstName[0]}
//                           {seller.lastName[0]}
//                         </div>
//                         <div>
//                           <p className="font-bold text-gray-900 leading-none mb-1">
//                             {seller.firstName} {seller.lastName}
//                           </p>
//                           <p className="text-xs text-muted-foreground font-medium">
//                             @{seller.username}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="text-right hidden sm:block">
//                         <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                           {seller.productCount} Umumiy Mahsulotlar
//                         </p>
//                         <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                           {" "}
//                           Balans
//                         </p>
//                         <p className="font-black text-blue-600 tabular-nums">
//                           {seller.totalValue.toLocaleString()}
//                           {`so'm`}
//                         </p>
//                       </div>
//                     </div>
//                   </AccordionTrigger>
//                   <AccordionContent className="px-6 pb-6">
//                     <div className="rounded-2xl border border-gray-100 bg-gray-50/50 overflow-hidden shadow-inner mt-2">
//                       <Table>
//                         <TableHeader className="bg-gray-100/80">
//                           <TableRow className="hover:bg-transparent border-gray-200">
//                             <TableHead className="font-bold text-gray-600">
//                               Mahsulot
//                             </TableHead>
//                             <TableHead className="text-center font-bold text-gray-600">
//                               Soni
//                             </TableHead>
//                             <TableHead className="text-right font-bold text-gray-600">
//                               Qiymati
//                             </TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {/* Bu yerda interface boyicha assignedProducts yoki boshqa arrayni map qilamiz */}
//                           <TableRow className="border-gray-100">
//                             <TableCell
//                               colSpan={3}
//                               className="text-center py-8 text-muted-foreground italic text-xs"
//                             >
//                               Hozircha faqat umumiy statistika mavjud.
//                               Detallashtirilgan API integratsiyasi Atabekni
//                               kutilmoqda.
//                             </TableCell>
//                           </TableRow>
//                         </TableBody>
//                       </Table>
//                     </div>
//                   </AccordionContent>
//                 </AccordionItem>
//               </Accordion>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </TabsContent>
//   );
// }

// /** * Yordamchi Komponentlar
//  */

// interface StatItemProps {
//   title: string;
//   value: number | string;
//   icon: React.ReactNode;
//   desc: string;
//   isPrice?: boolean;
//   unit?: string;
// }

// function StatItem({ title, value, icon, desc, isPrice, unit }: StatItemProps) {
//   const formattedValue = isPrice
//     ? `${Number(value).toLocaleString()} so'm`
//     : `${value} ${unit || ""}`;

//   return (
//     <Card className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all border border-gray-50 rounded-2xl group">
//       <CardContent className="p-6">
//         <div className="flex justify-between items-start mb-4">
//           <div className="p-2.5 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
//             {icon}
//           </div>
//           <div className="text-[10px] font-black bg-gray-50 text-gray-400 px-2 py-1 rounded-lg uppercase tracking-widest">
//             LIVE
//           </div>
//         </div>
//         <div className="space-y-1">
//           <h3 className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
//             {formattedValue}
//           </h3>
//           <div className="flex flex-col">
//             <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
//               {title}
//             </span>
//             <p className="text-[10px] text-gray-400 font-medium mt-1">{desc}</p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function ReportsSkeleton() {
//   return (
//     <div className="mt-4 space-y-8 animate-pulse p-4">
//       <div className="h-24 w-full bg-gray-200 rounded-2xl border" />
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         {[1, 2, 3, 4].map((i) => (
//           <div key={i} className="h-32 bg-gray-100 rounded-2xl border" />
//         ))}
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="h-80 col-span-2 bg-gray-100 rounded-2xl border" />
//         <div className="h-80 bg-gray-100 rounded-2xl border" />
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useMemo } from "react";
import { useExportExcel, useReports } from "@/hooks/useAdminData";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useToast } from "@/hooks/useToast";
import {
  Download,
  Package,
  TrendingUp,
  ShoppingCart,
  Calendar,
  History,
  Award,
  BarChart3,
  CircleDot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  AnalyticInventoryData,
  InventorySeller,
} from "@/interface/analytic.type";
import { Report } from "@/interface/report.type";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to get date one month ahead
const getOneMonthAhead = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);
  return newDate;
};

export default function AdminReports() {
  const { showToast } = useToast();
  const today = new Date();
  const oneMonthLater = getOneMonthAhead(today);

  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(oneMonthLater);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  // Format dates for API
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  const { data: reports, isLoading: reportsLoading } = useReports(
    formattedStartDate,
    formattedEndDate,
  ) as { data: Report; isLoading: boolean };

  const { data: analytics, isLoading: analyticsLoading } = useAnalytics() as {
    data: AnalyticInventoryData;
    isLoading: boolean;
  };

  const { mutate: exportExcel, isPending: isExporting } = useExportExcel();

  const handleExportExcel = () => {
    exportExcel(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        const date = new Date().toISOString().split("T")[0];
        link.setAttribute("download", `Hisobot_${date}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showToast("Excel hisobot muvaffaqiyatli yuklandi", "success");
      },
      onError: () => showToast("Excel yuklashda xatolik yuz berdi", "error"),
    });
  };

  const pieData = useMemo(
    () =>
      analytics
        ? [
            {
              name: "Asosiy Ombor",
              value: analytics.summary.warehouseStockValue,
            },
            {
              name: "Sotuvchilardagi",
              value: analytics.summary.sellerStockValue,
            },
          ]
        : [],
    [analytics],
  );

  const barData = useMemo(
    () =>
      analytics
        ? analytics.sellers.map((s: InventorySeller) => ({
            name: s.firstName || s.username,
            value: s.totalValue,
          }))
        : [],
    [analytics],
  );

  if (reportsLoading || analyticsLoading) return <ReportsSkeleton />;

  return (
    <TabsContent value="reports" className="mt-4 space-y-8">
      {/* Header & Date Range Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <BarChart3 className="h-6 w-6" /> Analitika Markazi
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Ombor va sotuvlar monitoringi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            <Calendar className="h-4 w-4 text-gray-500 ml-2" />

            {/* Start Date Picker */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setIsStartOpen(!isStartOpen)}
                className="h-8 px-3 border-none bg-transparent shadow-none hover:bg-gray-100 font-semibold text-sm rounded-lg"
              >
                {startDate.toLocaleDateString("uz-UZ", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Button>

              {isStartOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsStartOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-0 z-50 overflow-hidden min-w-[280px]">
                    <DatePicker
                      selectedDate={startDate}
                      onChange={(date) => {
                        setStartDate(date);
                        setIsStartOpen(false);
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            <span className="text-gray-400 font-bold">—</span>

            {/* End Date Picker */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setIsEndOpen(!isEndOpen)}
                className="h-8 px-3 border-none bg-transparent shadow-none hover:bg-gray-100 font-semibold text-sm rounded-lg"
              >
                {endDate.toLocaleDateString("uz-UZ", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Button>

              {isEndOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsEndOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-0 z-50 overflow-hidden min-w-[280px]">
                    <DatePicker
                      selectedDate={endDate}
                      minDate={startDate}
                      onChange={(date) => {
                        setEndDate(date);
                        setIsEndOpen(false);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <Button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="text-white rounded-xl px-5 h-11 gap-2 transition-all active:scale-95 shadow-md"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Excel Hisobot
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatItem
          title="Umumiy Tovar"
          value={reports?.summary?.totalProducts || 0}
          icon={<Package className="text-orange-500" />}
          desc="Ombordagi turlar"
          unit="ta"
        />
        <StatItem
          title="Ombor Qiymati"
          value={analytics?.summary?.warehouseStockValue || 0}
          icon={<TrendingUp className="text-emerald-500" />}
          desc="Toza qoldiq"
          isPrice
        />
        <StatItem
          title="Sotuvchilarda"
          value={analytics?.summary?.sellerStockValue || 0}
          icon={<ShoppingCart className="text-blue-500" />}
          desc="Aylanma summasi"
          isPrice
        />
        <StatItem
          title="Davr Tushumi"
          value={Number(reports?.summary?.totalRevenue) || 0}
          icon={<Award className="text-purple-500" />}
          desc="Savdo hajmi"
          isPrice
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-gray-800">
                Sotuvchilar Balansi
              </CardTitle>
              <CardDescription>{`Joriy tovarlar summasi (so'mda)`}</CardDescription>
            </div>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis hide />
                <RechartsTooltip
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(val: number) => [
                    `${val.toLocaleString()} $`,
                    "Summa",
                  ]}
                />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <CircleDot className="h-4 w-4" /> Resurs Taqsimoti
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val: number) => `${val.toLocaleString()} $`}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

     
     
    </TabsContent>
  );
}

/** Helper Components */

interface StatItemProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  desc: string;
  isPrice?: boolean;
  unit?: string;
}

function StatItem({ title, value, icon, desc, isPrice, unit }: StatItemProps) {
  const formattedValue = isPrice
    ? `${Number(value).toLocaleString()} $`
    : `${value} ${unit || ""}`;

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all border border-gray-50 rounded-2xl group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            {icon}
          </div>
          <div className="text-[10px] font-black bg-gray-50 text-gray-400 px-2 py-1 rounded-lg uppercase tracking-widest">
            LIVE
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
            {formattedValue}
          </h3>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {title}
            </span>
            <p className="text-[10px] text-gray-400 font-medium mt-1">{desc}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportsSkeleton() {
  return (
    <div className="mt-4 space-y-8 animate-pulse p-4">
      <div className="h-24 w-full bg-gray-200 rounded-2xl border" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl border" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-80 col-span-2 bg-gray-100 rounded-2xl border" />
        <div className="h-80 bg-gray-100 rounded-2xl border" />
      </div>
    </div>
  );
}

/** Custom Calendar Component */
interface DatePickerProps {
  selectedDate: Date;
  minDate?: Date;
  onChange: (date: Date) => void;
}

function DatePicker({ selectedDate, minDate, onChange }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const monthNames = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ];

  const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty cells for days before month starts
    for (
      let i = 0;
      i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1);
      i++
    ) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const isDateDisabled = (day: number | null) => {
    if (!day || !minDate) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    return date < minDate;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number | null) => {
    if (!day) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const handleDayClick = (day: number | null) => {
    if (!day || isDateDisabled(day)) return;
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    onChange(newDate);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="text-sm font-bold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const disabled = isDateDisabled(day);
          const today = isToday(day);
          const selected = isSelected(day);

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={!day || disabled}
              className={`
                h-9 w-9 rounded-lg text-sm font-medium transition-all
                ${!day ? "invisible" : ""}
                ${disabled ? "text-gray-300 cursor-not-allowed" : ""}
                ${
                  selected
                    ? "bg-black text-white hover:bg-black"
                    : today
                      ? "bg-white-50 text-black-600 hover:bg-white-100"
                      : !disabled
                        ? "hover:bg-gray-100 text-gray-700"
                        : ""
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => onChange(new Date())}
          className="flex-1 px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-100 rounded-lg transition-colors"
        >
          Bugun
        </button>
      </div>
    </div>
  );
}
