"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Package,
  ArrowLeftRight,
  Phone,
  ArrowLeft,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";
import { useSellerDetail } from "@/hooks/useSellerData";
import { useSellerStocks, useUpdateStock } from "@/hooks/useSellerStocks";
import { SellerStockDetail } from "@/interface/seller-stock.type";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export default function AdminSellerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sellerId = params.adminID as string;
  const [search, setSearch] = useState("");
  const { data: stocksData, isLoading: stocksLoading } =
    useSellerStocks(sellerId);
  const { mutate: updateStock, isPending: isSaving } = useUpdateStock();
  const {
    data: sellerData,
    isLoading: sellerLoading,
    isError,
  } = useSellerDetail(sellerId);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<SellerStockDetail | null>(
    null,
  );
  const [tempQuantity, setTempQuantity] = useState<number>(0);

  const openEditDrawer = (stock: SellerStockDetail) => {
    setSelectedStock(stock);
    setTempQuantity(stock.quantity);
    setIsOpen(true);
  };

  const handleStep = (step: number) => {
    if (!selectedStock) return;
    const nextVal = tempQuantity + step;

    if (nextVal > selectedStock.product.warehouseQuantity) {
      toast.error(
        `Omborda bor-yo'g'i ${selectedStock.product.warehouseQuantity} ta bor!`,
      );
      return;
    }
    if (nextVal < 0) return;

    setTempQuantity(nextVal);
  };

  const handleSave = () => {
    if (!selectedStock) return;
    updateStock(
      { stockId: selectedStock._id, quantity: tempQuantity },
      {
        onSuccess: () => {
          toast.success("Miqdor saqlandi");
          setIsOpen(false);
        },
        onError: () => toast.error("Xatolik yuz berdi"),
      },
    );
  };

  const seller = sellerData?.seller;
  const stocks = stocksData?.sellerStocks || [];

  const filteredStocks = stocks.filter((s) =>
    s.product.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (sellerLoading || stocksLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-sm" />
        <Skeleton className="h-[400px] w-full rounded-sm" />
      </div>
    );
  }

  if (isError || !seller) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-sm font-bold text-slate-500 uppercase">{`Sotuvchi ma'lumotlarini yuklab bo'lmadi`}</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >{`Orqaga qaytish`}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 shadow-sm border-slate-200"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">
              {seller.firstName} {seller.lastName}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              @{seller.username} • {seller.role}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="bg-white px-3 py-1.5 border-slate-200 text-slate-600 shadow-sm"
          >
            <Phone size={12} className="mr-2 text-primary" />{" "}
            {seller.phoneNumber || "Noma'lum"}
          </Badge>
          <Badge
            variant="outline"
            className={`px-3 py-1.5 border-slate-200 shadow-sm font-bold text-[10px] uppercase ${
              seller.isActive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {seller.isActive ? "Faol" : "Nofaol"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <div className="bg-white p-2 border rounded-sm shadow-sm mb-6">
          <TabsList className="grid w-full grid-cols-2 sm:w-[400px] h-10 bg-slate-100 p-1 rounded-sm">
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-wider gap-2 rounded-sm"
            >
              <Package size={14} className="text-primary" /> Inventar
            </TabsTrigger>
            <TabsTrigger
              value="returns"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-wider gap-2 rounded-sm"
            >
              <ArrowLeftRight size={14} className="text-primary" /> Zaxirani
              qaytarish
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inventory" className="mt-0 outline-none">
          <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-800">
                    {`Sotuvchi qo'lidagi mahsulotlar`}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                    {`Hozirda sotuvchida mavjud bo'lgan jami tovarlar ro'yxati`}
                  </CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Mahsulotlarni qidirish..."
                    className="pl-10 h-10 rounded-sm border-slate-200 bg-white shadow-none focus-visible:ring-primary"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase py-4 px-6">
                        Mahsulot nomi
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase py-4 px-6">
                        SKU
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase py-4 px-6 text-center">
                        Miqdor
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase py-4 px-6 text-right">
                        Narxi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocksLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-40 text-center">
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      </TableRow>
                    ) : filteredStocks.length > 0 ? (
                      filteredStocks.map((stock) => (
                        <TableRow
                          onClick={() => openEditDrawer(stock)}
                          key={stock._id}
                          className="hover:bg-slate-50/50"
                        >
                          <TableCell className="px-6 py-4">
                            <p className="text-xs font-black uppercase text-slate-800">
                              {stock?.product?.name}
                            </p>
                          </TableCell>
                          <TableCell className="px-6 py-4 uppercase text-[10px] font-bold text-slate-500">
                            {stock.product?.sku}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-sm">
                              {stock?.quantity} ta
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <p className="text-xs font-black text-slate-900">
                              {stock?.product?.price.toLocaleString()} UZS
                            </p>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-32 text-center text-[10px] font-bold uppercase text-slate-400"
                        >
                          Mahsulot topilmadi
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="mt-0 outline-none">
          <Card className="rounded-sm border-slate-200 shadow-none border-dashed bg-slate-50/50">
            <CardContent className="h-64 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-white rounded-full border border-slate-200 text-slate-400">
                <ArrowLeftRight size={32} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-slate-800 tracking-widest">
                  Zaxirani qaytarish
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 max-w-[300px]">
                  {`Sotuvchi qo'lidagi tovarlarni omborga qaytarish qismi hozircha tayyor emas.`}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="bg-white border-none rounded-t-[40px]">
          <div className="mx-auto w-12 h-1 bg-slate-100 rounded-full mt-4" />
          <div className="mx-auto w-full max-w-sm px-6">
            <DrawerHeader className="pt-8">
              <DrawerTitle className="text-center text-xs font-black uppercase tracking-widest text-slate-400">
                Zaxira miqdori
              </DrawerTitle>
              <DrawerDescription className="text-center text-lg font-black text-slate-800 uppercase mt-2">
                {selectedStock?.product?.name}
              </DrawerDescription>
            </DrawerHeader>

            <div className="py-16 flex items-center justify-between">
              <Button
                variant="secondary"
                size="icon"
                className="h-16 w-16 rounded-3xl bg-slate-100 hover:bg-slate-200 text-slate-900 border-none shadow-none"
                onClick={() => handleStep(-1)}
              >
                <Minus size={28} />
              </Button>

              <div className="flex flex-col items-center">
                <span className="text-8xl font-black tracking-tighter tabular-nums text-slate-900">
                  {tempQuantity}
                </span>
                <span className="text-[10px] font-black text-primary uppercase mt-4 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                  Omborda: {selectedStock?.product?.warehouseQuantity}
                </span>
              </div>

              <Button
                variant="secondary"
                size="icon"
                className="h-16 w-16 rounded-3xl bg-slate-100 hover:bg-slate-200 text-slate-900 border-none shadow-none"
                onClick={() => handleStep(1)}
              >
                <Plus size={28} />
              </Button>
            </div>

            <DrawerFooter className="pb-12 pt-0">
              <Button
                onClick={handleSave}
                disabled={isSaving || tempQuantity === selectedStock?.quantity}
                className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs hover:bg-slate-800 shadow-xl shadow-slate-200"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  "Tasdiqlash"
                )}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  className="h-12 font-bold text-slate-400 uppercase text-[10px]"
                >
                  Bekor qilish
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
