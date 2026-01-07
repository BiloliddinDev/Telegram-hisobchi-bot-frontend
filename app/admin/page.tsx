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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/useToast";
import { StockTransferModule } from "@/components/admin/StockTransferModule";
import { TransferHistoryTable } from "@/components/admin/TransferHistoryTable";
import AdminHeader from "@/components/admin/AdminHeader";
import TabsProducts from "@/components/admin/TabsProducts";
import AdminSellers from "@/components/admin/AdminSellers";
import AdminReports from "@/components/admin/AdminReports";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { ToastComponent } = useToast();

  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

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
          <AdminHeader />
          <TabsProducts />
          <AdminSellers />
          <AdminReports />

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
