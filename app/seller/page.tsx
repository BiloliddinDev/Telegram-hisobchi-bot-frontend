/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useSellerProducts, useSellerSales, useSellerReports } from "@/hooks/useSellerData";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/interface/products.type";
import { Sale } from "@/interface/sale.type";
import { useCreateSale } from "@/hooks/useSales";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import axios from "axios";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function SellerPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { ToastComponent, showToast } = useToast();
  
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts, error: productsError } = useSellerProducts();
  const { data: sales = [], isLoading: salesLoading, refetch: refetchSales, error: salesError } = useSellerSales();
  const { data: reports, isLoading: reportsLoading, refetch: refetchReports, error: reportsError } = useSellerReports();
  const { mutateAsync: createSale } = useCreateSale();
  
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (user && user.role !== "seller") {
      router.push("/");
    }
  }, [user, router]);

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      showToast("Mahsulot qolmagan", "error");
      return;
    }

    setCart(prev => {
      const currentQty = prev[product._id]?.quantity || 0;
      if (currentQty >= product.stock) {
        showToast("Ombordagi miqdordan ko'p sotib bo'lmaydi", "error");
        return prev;
      }
      return {
        ...prev,
        [product._id]: {
          product,
          quantity: currentQty + 1
        }
      };
    });
  };
  const handleCheckout = async () => {
    const items = Object.values(cart);
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      // Backend bir vaqtda bitta sale qabul qilgani uchun ketma-ket yuboramiz
      for (const item of items) {
        await createSale({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        });
      }
      
      showToast("Sotuv muvaffaqiyatli amalga oshirildi", "success");
      setCart({});
      refetchProducts();
      refetchSales();
      refetchReports();
    } catch (error: unknown) {
      let errorMessage = "Xatolik yuz berdi";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const cartTotal = Object.values(cart).reduce(
    (sum, item) => sum + item.product.price * item.quantity, 
    0
  );

  const cartItemsCount = Object.values(cart).reduce(
    (sum, item) => sum + item.quantity, 
    0
  );

  if (productsLoading || salesLoading || reportsLoading) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isUnauthorized = 
    (axios.isAxiosError(productsError) && productsError.response?.status === 401) || 
    (axios.isAxiosError(salesError) && salesError.response?.status === 401) || 
    (axios.isAxiosError(reportsError) && reportsError.response?.status === 401);

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] text-white flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Ruxsat yo'q</h2>
        <p className="text-zinc-400 mb-6">Sizda ushbu sahifani ko'rish uchun ruxsat yo'q yoki sessiya muddati tugagan.</p>
        <Button onClick={() => router.push("/")} className="bg-primary">
          Bosh sahifaga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white pb-32">
      <ToastComponent />
      
      <div className="p-4 flex justify-between items-center bg-[#242424] border-b border-zinc-800 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold">Sotuvchi</h1>
          <p className="text-[10px] text-zinc-400">
            {user?.firstName || user?.username} • {new Date().toLocaleDateString("uz-UZ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="bg-zinc-900 border-zinc-800">
              <TabsTrigger value="products" className="text-xs data-[state=active]:bg-primary">Do&apos;kon</TabsTrigger>
              <TabsTrigger value="sales" className="text-xs data-[state=active]:bg-primary">Tarix</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs data-[state=active]:bg-primary">Stat</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="products" className="mt-0 outline-none">
            <div className="mb-4">
              <Input 
                placeholder="Qidirish..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#242424] border-zinc-800 text-white placeholder:text-zinc-500 h-11"
              />
            </div>

            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.length === 0 ? (
                <p className="text-zinc-500 col-span-full text-center py-10">
                  Mahsulot topilmadi
                </p>
              ) : (
                filteredProducts.map((product: Product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    onSelect={handleAddToCart}
                    selectedCount={cart[product._id]?.quantity}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="sales" className="mt-0 outline-none">
            <div className="space-y-3">
              {sales.length === 0 ? (
                <p className="text-zinc-500 text-center py-10">Hali sotuvlar yo&apos;q</p>
              ) : (
                sales.map((sale: Sale) => (
                  <Card key={sale._id} className="bg-[#242424] border-zinc-800 text-white overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center text-xs text-zinc-500">
                            {sale.product?.name?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium text-sm leading-tight">
                              {sale.product?.name}
                            </h3>
                            <p className="text-[10px] text-zinc-400 mt-1">
                              {sale.quantity} ta x {(sale.price || 0).toLocaleString()} so&apos;m
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            {(sale.totalPrice || 0).toLocaleString()}
                          </p>
                          <span className="text-[9px] text-zinc-500">
                            {new Date(sale.createdAt).toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-0 outline-none">
            {reports && (
              <div className="grid grid-cols-1 gap-3">
                <Card className="bg-[#242424] border-zinc-800 text-white">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-medium text-zinc-400">Jami daromad</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold text-primary">
                      {(reports?.summary?.totalRevenue || 0).toLocaleString()} so&apos;m
                    </p>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-[#242424] border-zinc-800 text-white">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-xs font-medium text-zinc-400">Sotuvlar</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xl font-bold">{reports.summary.totalSales} ta</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#242424] border-zinc-800 text-white">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-xs font-medium text-zinc-400">Mahsulotlar</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xl font-bold">{reports.summary.totalQuantity} ta</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Savat va Checkout qismi */}
      {cartItemsCount > 0 && activeTab === "products" && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#242424] border-t border-zinc-800 p-4 shadow-2xl z-20 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 p-2 rounded-full">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Savatda {cartItemsCount} ta mahsulot</p>
                  <p className="text-lg font-bold">{(cartTotal || 0).toLocaleString()} so&apos;m</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCart({})}
                className="text-zinc-500 hover:text-white"
              >
                Tozalash
              </Button>
            </div>
            
            <Button 
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sotilmoqda...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  Sotishni tasdiqlash
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
