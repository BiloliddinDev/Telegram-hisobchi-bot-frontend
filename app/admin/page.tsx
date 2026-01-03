"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/useToast";
import { useProducts } from "@/hooks/useProducts";
import { useSellers, useReports, useExportExcel } from "@/hooks/useAdminData";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SellerCard } from "@/components/SellerCard";
import { CreateProductDialog } from "@/components/admin/CreateProductDialog";
import { CreateCategoryDialog } from "@/components/admin/CreateCategoryDialog";
import { CreateSellerDialog } from "@/components/admin/CreateSellerDialog";
import { StockTransferModule } from "@/components/admin/StockTransferModule";
import { TransferHistoryTable } from "@/components/admin/TransferHistoryTable";
import { ProductTable } from "@/components/admin/ProductTable";
import { Button } from "@/components/ui/button";
import { Seller, SellerAnalytics } from "@/interface/seller.type";
import { TrendingUp, Users, Package, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { ToastComponent, showToast } = useToast();

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: sellers = [], isLoading: sellersLoading } = useSellers();
  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const [activeTab, setActiveTab] = useState("products");
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
      onError: () => {
        showToast("Excel yuklashda xatolik yuz berdi", "error");
      }
    });
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  if (productsLoading || sellersLoading || reportsLoading || analyticsLoading) {
    return <div className="p-4 text-center">Yuklanmoqda...</div>;
  }

  const pieData = analytics ? [
    { name: "Asosiy Ombor", value: analytics.summary.warehouseStockValue },
    { name: "Sotuvchilardagi", value: analytics.summary.sellerStockValue },
  ] : [];

  const barData = analytics ? analytics.sellers.map((s: SellerAnalytics) => ({
    name: s.firstName || s.username || "Noma'lum",
    value: s.totalValue
  })) : [];

  return (
    <div className="min-h-screen bg-background p-4">
      <ToastComponent />
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Salom, {user?.firstName || user?.username || "Admin"}!
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 h-auto">
            <TabsTrigger value="products">Mahsulotlar</TabsTrigger>
            <TabsTrigger value="sellers">Sotuvchilar</TabsTrigger>
            <TabsTrigger value="reports">Hisobotlar</TabsTrigger>
            <TabsTrigger value="assign">Biriktirish</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Mahsulotlar</CardTitle>
                    <CardDescription>
                      Barcha mahsulotlarni boshqaring
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <CreateCategoryDialog />
                    <CreateProductDialog />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ProductTable products={products} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Sotuvchilar</CardTitle>
                    <CardDescription>
                      Barcha sotuvchilarni boshqaring
                    </CardDescription>
                  </div>
                  <CreateSellerDialog />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {sellers.map((seller: Seller) => (
                    <SellerCard key={seller._id} seller={seller} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-4 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Hisobotlar va Analitika</h2>
                <p className="text-muted-foreground text-sm">Tizimdagi barcha harakatlar va qoldiqlar statistikasi</p>
              </div>
              <Button
                onClick={handleExportExcel}
                disabled={isExporting}
                variant="default"
                className="w-full md:w-auto gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Tayyorlanmoqda...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    📥 Excel yuklash
                  </>
                )}
              </Button>
            </div>

            {/* Global Inventory Summary */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Umumiy tovar qiymati</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(analytics?.summary?.totalInventoryValue || 0).toLocaleString()} so&apos;m</div>
                    <p className="text-xs text-muted-foreground mt-1">Ombor + Sotuvchilardagi</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Ombordagi toza qoldiq</CardTitle>
                    <Package className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{(analytics?.summary?.warehouseStockValue || 0).toLocaleString()} so&apos;m</div>
                    <p className="text-xs text-muted-foreground mt-1">Tarqatilmagan tovarlar</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Sotuvchilardagi aylanma</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{(analytics?.summary?.sellerStockValue || 0).toLocaleString()} so&apos;m</div>
                    <p className="text-xs text-muted-foreground mt-1">Sotilmagan tovarlar</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sales Summary (Existing Reports) */}
            {reports && (
              <Card>
                <CardHeader>
                  <CardTitle>Oylik Savdo Hisoboti</CardTitle>
                  <CardDescription>Joriy oy uchun savdo statistikasi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Jami savdo</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{reports.summary.totalSales} ta</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-500/5 border-green-500/20">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Jami daromad</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold text-green-600">
                          {(reports?.summary?.totalRevenue || 0).toLocaleString()} so&apos;m
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-500/5 border-blue-500/20">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Sotilgan mahsulotlar</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold text-blue-600">{reports.summary.totalQuantity} ta</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-500/5 border-orange-500/20">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Jami mahsulotlar</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold text-orange-600">{products.length} ta</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Sotuvchilar kesimida taqsimot</CardTitle>
                    <CardDescription>Sotuvchilardagi tovarlar summasi</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                        <RechartsTooltip
                          formatter={(value: number) => [`${(value || 0).toLocaleString()} so'm`, "Qiymat"]}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ombor vs Sotuvchilar</CardTitle>
                    <CardDescription>Tovar ulushi foizda</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => `${(value || 0).toLocaleString()} so'm`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Individual Seller Cards */}
            {analytics && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Sotuvchilar statistikasi
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analytics.sellers.map((seller: SellerAnalytics) => (
                    <Card key={seller._id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{seller.firstName} {seller.lastName}</CardTitle>
                        <CardDescription>@{seller.username || "username_yo'q"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm">Mavjud tovarlar:</span>
                            <span className="font-bold">{(seller?.totalValue || 0).toLocaleString()} so&apos;m</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm">Mahsulotlar soni:</span>
                            <span className="font-medium bg-secondary px-2 py-0.5 rounded-full text-xs">
                              {seller.productCount} ta
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="assign" className="mt-4 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Mahsulotlarni taqsimlash (Stock Transfer)</CardTitle>
                <CardDescription>
                  Ombordan sotuvchilarga mahsulot biriktirish
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StockTransferModule />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transferlar tarixi</CardTitle>
                <CardDescription>
                  Barcha amalga oshirilgan transferlar va qaytarmalar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransferHistoryTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
