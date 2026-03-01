"use client";

import { useState, useMemo } from "react";
import {
  useSellerStocks,
  useSellerSalesHistory,
  useProcessSale,
} from "@/hooks/useSellerData";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  ShoppingBag,
  CalendarIcon,
} from "lucide-react";
import { uz } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ProductStockItem } from "@/interface/seller-stock.type";
import { StockSkeleton } from "@/components/seller/SellerSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import SalesHistory from "@/components/seller/SalesHistory";
import CheckoutModal from "@/components/seller/CheckoutModal";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

export default function SellerPage() {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const formatDateAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [activeTab, setActiveTab] = useState("products");
  const startStr = useMemo(() => formatDateAPI(startDate), [startDate]);
  const endStr = useMemo(() => formatDateAPI(endDate), [endDate]);

  const { data: stockData, isLoading: stockLoading } = useSellerStocks();
  const { data: salesData, isLoading: salesLoading } = useSellerSalesHistory(
    startStr,
    endStr,
  );
  const { mutateAsync: processSale, isPending: isSelling } = useProcessSale();

  const [cart, setCart] = useState<
    Record<string, { stock: ProductStockItem; qty: number; price: number }>
  >({});
  const filteredStocks = useMemo(
    () =>
      stockData?.sellerStocks.filter(
        (s) =>
          s.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.product.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || [],
    [stockData, searchTerm],
  );

  const totalHistoryAmount = useMemo(() => {
    return salesData?.reduce((sum, sale) => sum + sale.totalAmount, 0) || 0;
  }, [salesData]);

  const totalHistoryCount = useMemo(() => {
    return salesData?.length || 0;
  }, [salesData]);

  const handleAddToCart = (stock: ProductStockItem) => {
    const current = cart[stock.product._id];
    const currentQty = current?.qty || 0;

    if (currentQty >= stock.stock.quantity) {
      showToast("Ombordagi miqdordan ko'p sotib bo'lmaydi", "error");
      return;
    }

    setCart((prev) => ({
      ...prev,
      [stock.product._id]: {
        stock,
        qty: currentQty + 1,
        price: stock.product.price,
      },
    }));
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      const item = prev[id];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      }
      if (newQty > item.stock.stock.quantity) return prev;
      return { ...prev, [id]: { ...item, qty: newQty } };
    });
  };

  const updatePrice = (id: string, newPrice: number) => {
    setCart((prev) => ({
      ...prev,
      [id]: { ...prev[id], price: newPrice },
    }));
  };

  const totalCartAmount = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  const discountAmount = totalCartAmount * (discount / 100);
  const finalAmount = totalCartAmount - discountAmount;

  const onCheckout = () => {
    if (Object.keys(cart).length === 0) return;
    setIsModalOpen(true);
  };

  const handleFinalSubmit = async (formData: {
    customerName: string;
    customerPhone: string;
    notes: string;
    paidAmount: number;
    dueDate: Date | null;
    isNasiya: boolean;
    discount: number;
    discountPercent: number;
  }) => {
    try {
      const orderId = uuidv4();
      const items = Object.values(cart).map((item) => ({
        productId: item.stock.product._id,
        quantity: item.qty,
        price: item.price,
      }));

      // ✅ MUHIM: Backend-ga totalAmount va paidAmount-ni aniq yuboramiz
      // Agar naqd bo'lsa, paidAmount totalAmount-ga teng bo'lishi kerak
      await processSale({
        orderId,
        items,
        totalAmount: finalAmount,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        notes: formData.notes,
        paidAmount: formData.paidAmount, // Modal ichidan kelgan qiymat
        dueDate: formData.dueDate,
        discount: discountAmount, // Umumiy chegirma summasi
        discountPercent: discount, // % da
      });

      showToast("Sotuv muvaffaqiyatli yakunlandi", "success");
      setCart({});
      setDiscount(0);
      setIsModalOpen(false);
    } catch (error: any) {
      const message =
        error.response?.data?.error || "Sotuvda xatolik yuz berdi";
      showToast(message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 mt-20">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <ShoppingBag className="text-primary w-6 h-6" /> Sotuv Paneli
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Sotuvchi: {user?.firstName || user?.username || "Admin"}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="text-gray-400">Jami qoldiq:</span>
          {stockLoading ? (
            <Skeleton className="h-5 w-12" />
          ) : (
            <Badge variant="outline" className="border-gray-300">
              {stockData?.summary.totalQuantity} ta
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <Tabs
          defaultValue="products"
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-1">
            <TabsList className="justify-start border-none rounded-none bg-transparent h-auto p-0 gap-8">
              <TabsTrigger
                value="products"
                className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3 bg-transparent shadow-none font-bold text-sm transition-all uppercase"
              >
                Mahsulotlar
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3 bg-transparent shadow-none font-bold text-sm transition-all uppercase"
              >
                Sotuv Tarixi
              </TabsTrigger>
            </TabsList>

            {/* KALENDAR: Faqat history tanlanganda chiqadi */}
            {activeTab === "history" && (
              <div className="flex items-center gap-2 mb-2 bg-white border rounded-lg p-1 shadow-sm">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[11px] font-bold uppercase hover:bg-slate-50"
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                      {format(startDate, "dd MMM", { locale: uz })} —{" "}
                      {format(endDate, "dd MMM", { locale: uz })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 flex flex-col md:flex-row shadow-2xl border-slate-200"
                    align="end"
                  >
                    <div className="p-2 border-b md:border-b-0 md:border-r">
                      <p className="text-[10px] font-black uppercase p-2 text-slate-400 text-center">
                        Dan
                      </p>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(d) => d && setStartDate(d)}
                        disabled={(date) => date > new Date()}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] font-black uppercase p-2 text-slate-400 text-center">
                        Gacha
                      </p>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(d) => d && setEndDate(d)}
                        disabled={(date) =>
                          date < startDate || date > new Date()
                        }
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <TabsContent value="products" className="mt-0 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Nomi yoki SKU bo'yicha qidirish..."
                    className="pl-10 h-11 bg-white border-gray-200 rounded-md focus-visible:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {stockLoading ? (
                  <StockSkeleton />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {filteredStocks.map((stock: ProductStockItem) => (
                      <Card
                        key={stock.stock._id}
                        onClick={() => handleAddToCart(stock)}
                        className="cursor-pointer hover:border-primary transition-colors border-gray-200 shadow-none rounded-sm"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-sm text-gray-900 line-clamp-2">
                                {stock.product.sku}
                              </h3>
                              <p
                                className={
                                  "font-bold  text-gray-900 line-clamp-2"
                                }
                              >
                                {stock.product.name}
                              </p>
                            </div>
                            {cart[stock.product._id] && (
                              <Badge className="bg-primary text-white ml-2">
                                {cart[stock.product._id].qty}
                              </Badge>
                            )}
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-gray-400 font-medium italic">
                                Narxi:
                              </p>
                              <p className="font-bold text-primary">
                                {stock.product.price.toLocaleString()} {"$"}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-bold bg-gray-100"
                            >
                              {stock.stock.quantity} ta mavjud
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <Card className="border-gray-200 shadow-sm rounded-sm sticky top-24">
                  <CardHeader className="p-4 border-b bg-gray-50/50">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                      <ShoppingCart size={18} /> Savat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* 1. Mahsulotlar ro'yxati */}
                    <div className="max-h-[400px] overflow-y-auto divide-y">
                      {Object.values(cart).length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-xs font-medium">
                          Savat bo'sh
                        </div>
                      ) : (
                        Object.values(cart).map((item) => (
                          <div
                            key={item.stock.stock._id}
                            className="p-3 space-y-3"
                          >
                            <div className="flex justify-between">
                              <p className="text-[11px] font-bold line-clamp-1 flex-1 uppercase">
                                {item.stock.product.name}
                              </p>
                              <button
                                className="text-gray-400 hover:text-red-500"
                                onClick={() =>
                                  updateQty(item.stock.product._id, -item.qty)
                                }
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 font-bold uppercase mr-3">
                                Sotuv Narxi:
                              </span>
                              <Input
                                type="text"
                                inputMode="decimal"
                                className="h-7 text-xs font-bold border-gray-300 rounded-none w-24"
                                value={item.price}
                                step="0.01"
                                onChange={(e) => {
                                  const val = e.target.value.replace(
                                    /[^0-9.]/g,
                                    "",
                                  );
                                  updatePrice(
                                    item.stock.product._id,
                                    Number(val),
                                  );
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center border rounded-md bg-white">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-none border-r p-0"
                                  onClick={() =>
                                    updateQty(item.stock.product._id, -1)
                                  }
                                >
                                  <Minus size={10} />
                                </Button>
                                <span className="text-xs font-bold w-8 text-center">
                                  {item.qty}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-none border-l p-0"
                                  onClick={() =>
                                    updateQty(item.stock.product._id, 1)
                                  }
                                >
                                  <Plus size={10} />
                                </Button>
                              </div>
                              <p className="text-xs font-bold text-gray-900">
                                {(item.price * item.qty).toLocaleString()} $
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* 2. Discount + Jami + Tugma */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                      {/* Discount */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-500 uppercase flex-1">
                          Discount:
                        </span>
                        <div className="flex items-center border border-gray-200 bg-white">
                          <Input
                            type="text"
                            inputMode="numeric"
                            min={0}
                            max={100}
                            value={discount}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              const num = Math.min(100, Number(val));
                              setDiscount(num);
                            }}
                            className="h-8 w-16 rounded-none border-none text-xs font-bold text-center"
                          />
                          <span className="px-2 text-xs font-black text-gray-400">
                            %
                          </span>
                        </div>
                      </div>

                      {/* Umumiy */}
                      {discount > 0 && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase">
                              Jami:
                            </span>
                            <span className="text-sm font-bold text-gray-400 line-through">
                              {totalCartAmount.toLocaleString()} $
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase">
                              Chegirma:
                            </span>
                            <span className="text-sm font-bold text-red-400">
                              -{discountAmount.toLocaleString()} $
                            </span>
                          </div>
                        </>
                      )}

                      {/* Final */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-gray-900 uppercase">
                          To'lov:
                        </span>
                        <span className="text-xl font-black text-gray-900">
                          {finalAmount.toLocaleString()} $
                        </span>
                      </div>

                      {/* Tugma */}
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 font-bold h-11 rounded-sm uppercase text-xs tracking-widest shadow-md"
                        disabled={Object.keys(cart).length === 0}
                        onClick={onCheckout}
                      >
                        Sotuvni yakunlash
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0 outline-none space-y-4">
            <SalesHistory
              totalAmount={totalHistoryAmount}
              totalCount={totalHistoryCount}
              orders={salesData || []}
              isLoading={salesLoading}
            />
          </TabsContent>
        </Tabs>
      </main>

      <CheckoutModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFinalSubmit}
        totalAmount={totalCartAmount}
        discount={discount} // ← qo'shing
        discountAmount={discountAmount}
        isSelling={isSelling}
      />
    </div>
  );
}
