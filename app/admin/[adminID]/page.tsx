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
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {useSellerDetail, useSellerDetailHistory} from "@/hooks/useSellerData";
import {
  useRemoveSellerStock,
  useSellerStocks,
  useUpdateStock,
} from "@/hooks/useSellerStocks";
import { ProductStockItem } from "@/interface/seller-stock.type";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { History } from "lucide-react";

export default function AdminSellerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sellerId = params.adminID as string;

  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState<number>(0);
  const [mode, setMode] = useState<"plus" | "minus">("plus");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<ProductStockItem | null>(
    null,
  );

  interface SaleRecord {
    _id: string;
    customerName: string;
    customerPhone: string;
    product: string; // Agar backenddan mahsulot ID-si kelsa
    quantity: number;
    totalAmount: number;
    timestamp: string | Date;
  }
  
  const { data: stocksData, isLoading: stocksLoading } =
    useSellerStocks(sellerId);
  const { mutate: updateStock, isPending: isSaving } = useUpdateStock();
  const { mutate: removeStock, isPending: isRemoving } = useRemoveSellerStock();
  const {
    data: sellerData,
    isLoading: sellerLoading,
  } = useSellerDetail(sellerId);
  
  
  const {
    data: sellerDataHistory,
    isLoading: sellerHistoryLoading,
    
  } = useSellerDetailHistory(sellerId);

  const seller = sellerData?.seller;
  const stocks = stocksData?.sellerStocks || [];
  const salesHistory = sellerDataHistory?.sales || [];

  const filteredStocks = stocks.filter((s) =>
    s.product.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openEditDrawer = (stock: ProductStockItem) => {
    setSelectedStock(stock);
    setDiff(0);
    setMode("plus");
    setIsOpen(true);
  };

  const handleStep = (step: number) => {
    if (!selectedStock) return;
    const nextDiff = diff + step;
    if (nextDiff < 0) return;

    if (mode === "plus") {
      if (nextDiff > selectedStock.product.warehouseQuantity) {
        toast.error(
          `Omborda bor-yo'g'i ${selectedStock.product.warehouseQuantity} ta bor!`,
        );
        return;
      }
    } else {
      if (nextDiff > selectedStock.stock.quantity) {
        toast.error(
          `Sotuvchida bor-yo'g'i ${selectedStock.stock.quantity} ta bor!`,
        );
        return;
      }
    }
    setDiff(nextDiff);
  };

  const handleSave = () => {
    if (!selectedStock) return;
    const finalQuantity =
      mode === "plus"
        ? selectedStock.stock.quantity + diff
        : selectedStock.stock.quantity - diff;
    updateStock(
      { stockId: selectedStock.stock._id, quantity: finalQuantity },
      {
        onSuccess: () => {
          toast.success("Muvaffaqiyatli yangilandi");
          setIsOpen(false);
        },
        onError: () => toast.error("Xatolik yuz berdi"),
      },
    );
  };

  // Mahsulotni sellerdan butunlay o'chirish
  const handleRemoveStock = (stockId: string) => {
    removeStock(stockId, {
      onSuccess: () => {
        toast.success(
          "Mahsulot seller ro'yxatidan o'chirildi va qoldiq omborga qaytdi",
        );
      },
      onError: () => toast.error("O'chirishda xatolik yuz berdi"),
    });
  };

  if (sellerLoading || stocksLoading || sellerHistoryLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 animate-pulse mt-20">
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

  if (!seller) {
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
    <div className="flex flex-col gap-6 p-6 bg-background min-h-screen mt-20">
      {/* HEADER */}
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
            className="bg-white px-3 py-1.5 border-slate-200 text-slate-600 shadow-sm font-bold"
          >
            <Phone size={12} className="mr-2 text-primary " />{" "}
            {seller.phoneNumber || "Noma'lum"}
          </Badge>
          <Badge
            variant="outline"
            className={`px-3 py-1.5 border-slate-200 shadow-sm font-bold text-[10px] uppercase ${seller.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
          >
            {seller.isActive ? "Faol" : "Nofaol"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <div className="bg-white p-2 border rounded-sm shadow-sm mb-6 overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 sm:w-[600px] h-10 bg-slate-100 p-1 rounded-sm">
            <TabsTrigger
                value="inventory"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-wider gap-2 rounded-sm"
            >
              <Package size={14} className="text-primary" /> Maxsulotlar
            </TabsTrigger>
            <TabsTrigger
                value="returns"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-wider gap-2 rounded-sm"
            >
              <ArrowLeftRight size={14} className="text-primary" /> Qaytarish
            </TabsTrigger>
            {/* YANGI TAB */}
            <TabsTrigger
                value="history"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-wider gap-2 rounded-sm"
            >
              <History size={14} className="text-primary" /> Sotuvlar tarixi
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inventory" className="mt-0 outline-none">
          <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-800">{`Sotuvchi qo'lidagi mahsulotlar`}</CardTitle>
                  <CardDescription className="text-[10px] font-bold text-slate-400 uppercase mt-1">{`Miqdorni qo'shish yoki ayirish uchun mahsulot ustiga bosing`}</CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Mahsulotlarni qidirish..."
                    className="pl-10 h-10 rounded-sm border-slate-200 bg-white shadow-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
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
                  {filteredStocks.length > 0 ? (
                    filteredStocks.map((stock) => (
                      <TableRow
                        onClick={() => openEditDrawer(stock)}
                        key={stock?.stock?._id}
                        className="hover:bg-slate-50/50 cursor-pointer"
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
                            {stock.stock?.quantity} ta
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <p className="text-xs font-black text-slate-900">
                            {stock?.product?.price.toLocaleString()} $
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ZAXIRANI QAYTARISH (O'CHIRISH) */}
        <TabsContent value="returns" className="mt-0 outline-none">
          <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
            <CardHeader className="bg-red-50/50 border-b border-red-100">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-500" size={18} />
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-red-800">{`Butunlay qaytarish`}</CardTitle>
                  <CardDescription className="text-[10px] font-bold text-red-400 uppercase mt-1">{`Mahsulotni sotuvchilar ro'yxatidan butunlay o'chirish va qoldiqni omborga qaytarish`}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase py-4 px-6">
                      Mahsulot
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase py-4 px-6 text-center">
                      Sellerdagi qoldiq
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase py-4 px-6 text-right">
                      Amal
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock) => (
                    <TableRow
                      key={stock.stock?._id}
                      className="hover:bg-slate-50/50"
                    >
                      <TableCell className="px-6 py-4">
                        <p className="text-xs font-black uppercase text-slate-800">
                          {stock.product.name}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                          {stock.product.sku}
                        </p>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className="text-red-600 border-red-200 bg-red-50 font-black"
                        >
                          {stock.stock.quantity} ta
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 font-black text-[10px] uppercase gap-2"
                            >
                              <Trash2 size={14} /> {`O'chirish`}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-sm">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="uppercase font-black text-sm tracking-widest">{`Ishonchingiz komilmi?`}</AlertDialogTitle>
                              <AlertDialogDescription className="text-xs font-bold text-slate-500 uppercase">
                                {`${stock.product.name} mahsuloti sellerdan butunlay o'chiriladi va ${stock.stock.quantity} ta qoldiq asosiy omborga qaytariladi.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-sm uppercase text-[10px] font-black">
                                Bekor qilish
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleRemoveStock(stock.stock._id)
                                }
                                className="bg-red-600 hover:bg-red-700 rounded-sm uppercase text-[10px] font-black"
                                disabled={isRemoving}
                              >
                                {isRemoving ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  "Ha, o'chirish"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>


        {/*{`3 qisim da korinsh kerke `}*/}
        <TabsContent value="history" className="mt-0 outline-none">
          <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-800">Sotilgan mahsulotlar tarixi</CardTitle>
                  <CardDescription className="text-[10px] font-bold text-slate-400 uppercase mt-1">Sotuvchi tomonidan amalga oshirilgan barcha tranzaksiyalar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase py-4 px-6">Mijoz / Sana</TableHead>
                    <TableHead className="text-[10px] font-black uppercase py-4 px-6">Mahsulot</TableHead>
                    <TableHead className="text-[10px] font-black uppercase py-4 px-6">Sana</TableHead>
                    <TableHead className="text-[10px] font-black uppercase py-4 px-6 text-center">Soni</TableHead>
                    <TableHead className="text-[10px] font-black uppercase py-4 px-6 text-right">Jami summa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesHistory.length > 0 ? (
                      salesHistory.map((sale: SaleRecord) => (
                          <TableRow key={sale._id} className="hover:bg-slate-50/50">
                            <TableCell className="px-6 py-4">
                              <p className="text-xs font-black uppercase text-slate-800">
                                {sale.customerName || "Noma'lum mijoz"}
                              </p>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <p className="text-[9px] font-bold text-slate-400">
                                {new Date(sale.timestamp).toLocaleString("uz-UZ")}
                              </p>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <p className="text-[9px] text-slate-400">{sale.customerPhone}</p>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center">
                              <Badge variant="outline" className="font-black text-xs w-12 text-center">
                                {sale.quantity} ta
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right">
                              <p className="text-xs w-12 font-black text-green-600">
                                + {sale.totalAmount.toLocaleString()} $
                              </p>
                            </TableCell>
                          </TableRow>
                      ))
                  ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-[10px] font-bold uppercase text-slate-400">
                          Hozircha sotuvlar mavjud emas
                        </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="bg-white border-none rounded-t-[40px] shadow-2xl">
          <div className="mx-auto w-12 h-1 bg-slate-100 rounded-full mt-4" />
          <div className="mx-auto w-full max-w-sm px-6">
            <DrawerHeader className="pt-8">
              <DrawerTitle className="text-center text-xs font-black uppercase tracking-widest text-slate-400">
                Inventarni boshqarish
              </DrawerTitle>
              <DrawerDescription className="text-center text-lg font-black text-slate-800 uppercase mt-2">
                {selectedStock?.product?.name}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex justify-center mt-4">
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(val) => {
                  if (val) setMode(val as "plus" | "minus");
                  setDiff(0);
                }}
                className="bg-slate-100 p-1 rounded-2xl"
              >
                <ToggleGroupItem
                  value="plus"
                  className="rounded-xl px-6 font-bold data-[state=on]:bg-white shadow-none text-[10px] uppercase tracking-wider"
                >{`Qo'shish`}</ToggleGroupItem>
                <ToggleGroupItem
                  value="minus"
                  className="rounded-xl px-6 font-bold data-[state=on]:bg-white shadow-none text-[10px] uppercase tracking-wider"
                >{`Ayirish`}</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="py-12 flex items-center justify-between">
              <Button
                variant="secondary"
                size="icon"
                className="h-16 w-16 rounded-3xl bg-slate-100 text-slate-900 border-none"
                onClick={() => handleStep(-1)}
              >
                <Minus size={28} />
              </Button>
              <div className="flex flex-col items-center">
                <span
                  className={`text-8xl font-black tracking-tighter tabular-nums`}
                >
                  {mode === "plus" ? "+" : "-"}
                  {diff}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                  Hozirda: {selectedStock?.stock.quantity} ta
                </span>
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="h-16 w-16 rounded-3xl bg-slate-100 text-slate-900 border-none"
                onClick={() => handleStep(1)}
              >
                <Plus size={28} />
              </Button>
            </div>

            <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase text-slate-400">
                  Yakuniy natija:
                </span>
                <span className="text-sm font-black text-slate-800">
                  {mode === "plus"
                    ? (selectedStock?.stock.quantity || 0) + diff
                    : (selectedStock?.stock.quantity || 0) - diff}{" "}
                  ta
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">{`Ombor qoldig'i:`}</span>
                <span className="text-[10px] font-bold text-slate-500">
                  {mode === "plus"
                    ? (selectedStock?.product.warehouseQuantity || 0) - diff
                    : (selectedStock?.product.warehouseQuantity || 0) +
                      diff}{" "}
                  ta
                </span>
              </div>
            </div>

            <DrawerFooter className="pb-12 pt-0">
              <Button
                onClick={handleSave}
                disabled={isSaving || diff === 0}
                className={`w-full h-16 rounded-2xl font-black uppercase text-xs transition-all shadow-xl text-white`}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  "O'zgarishni tasdiqlash"
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
