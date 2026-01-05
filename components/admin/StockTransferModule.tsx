"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSellers } from "@/hooks/useAdminData";
import { useProducts } from "@/hooks/useProducts";
import { useCreateTransfer } from "@/hooks/useTransfers";
import { useToast } from "@/hooks/useToast";
import { User } from "@/interface/User.type";
import { Product } from "@/interface/products.type";
import { BasketItem, CreateTransferPayload } from "@/interface/transfer.type";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Plus, Minus, Trash2, CheckCircle2,
  ChevronRight, ChevronLeft, User as UserIcon, Package
} from "lucide-react";
import axios, { AxiosError } from "axios";

export function StockTransferModule() {
  const [step, setStep] = useState<number>(1);
  const [selectedSeller, setSelectedSeller] = useState<User | null>(null);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [productSearch, setProductSearch] = useState<string>("");

  const { data: sellers = [], isLoading: sellersLoading } = useSellers();

  const { data: productData, isLoading: productsLoading } = useProducts({
    name: productSearch,
    page: 1,
    limit: 100 
  });

  const { mutate: createTransfer, isPending } = useCreateTransfer();
  const { showToast } = useToast();

  const products = productData?.docs || [];

  const filteredSellers = sellers.filter((s: User) =>
      `${s.firstName} ${s.lastName} ${s.username}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToBasket = (product: Product) => {
    const existing = basket.find(item => item.product._id === product._id);
    if (existing) {
      showToast("Mahsulot allaqachon savatda", "info");
      return;
    }
    setBasket([...basket, { product, quantity: 1 }]);
  };

  const removeFromBasket = (productId: string) => {
    setBasket(basket.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    setBasket(prev => prev.map(item => {
      if (item.product._id === productId) {
        const max = item.product.count;
        const newQty = Math.max(1, Math.min(qty, max));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleConfirm = () => {
    if (!selectedSeller || basket.length === 0) return;

    const payload: CreateTransferPayload = {
      sellerId: selectedSeller._id,
      items: basket.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }))
    };

    createTransfer(payload, {
      onSuccess: () => {
        showToast("Muvaffaqiyatli biriktirildi", "success");
        setStep(1);
        setSelectedSeller(null);
        setBasket([]);
      },
      onError: (error: Error | AxiosError) => {
        let errorMessage : string = "Xatolik yuz berdi";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message;
        } else {
          errorMessage = error.message;
        }
        showToast(errorMessage, "error");
      }
    });
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4 py-3 bg-white border rounded-sm overflow-x-auto shadow-sm">
          {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-shrink-0">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-colors ${
                    step >= s ? "bg-primary border-primary text-white" : "border-slate-200 text-slate-400"
                } font-black text-[10px]`}>
                  {step > s ? <CheckCircle2 size={16} /> : s}
                </div>
                <span className={`ml-2 text-[10px] font-black uppercase tracking-widest ${step === s ? "text-primary" : "text-slate-400"}`}>
                            {s === 1 && "Sotuvchi"}
                  {s === 2 && "Tanlash"}
                  {s === 3 && "Miqdor"}
                  {s === 4 && "Tasdiq"}
                        </span>
                {s < 4 && <ChevronRight size={14} className="mx-4 text-slate-300" />}
              </div>
          ))}
        </div>

     
        {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                    placeholder="Sotuvchini ism yoki foydalanuvchi nomi bo'yicha qidirish..."
                    className="pl-10 h-11 rounded-sm border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                {sellersLoading ? (
                    [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-sm" />)
                ) : (
                    filteredSellers.map((seller) => (
                        <Card
                            key={seller._id}
                            className={`cursor-pointer transition-all border rounded-sm hover:shadow-md ${
                                selectedSeller?._id === seller._id ? "border-primary ring-1 ring-primary/20 bg-primary/5" : "border-slate-200"
                            }`}
                            onClick={() => setSelectedSeller(seller)}
                        >
                          <CardContent className="p-4 flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-sm bg-slate-100 flex items-center justify-center text-primary font-black text-xs">
                              {seller.firstName?.[0]}{seller.lastName?.[0]}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-black uppercase text-slate-800 tracking-tight">
                                {seller.firstName} {seller.lastName}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">@{seller.username}</p>
                            </div>
                            {selectedSeller?._id === seller._id && <CheckCircle2 className="text-primary h-5 w-5" />}
                          </CardContent>
                        </Card>
                    ))
                )}
              </div>
              <div className="flex justify-end pt-4">
                <Button
                    disabled={!selectedSeller}
                    onClick={() => setStep(2)}
                    className="h-10 px-8 rounded-sm font-bold text-[11px] uppercase tracking-wider"
                >
                  Mahsulot tanlash <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
        )}

       
        {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between bg-slate-50 p-4 border rounded-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Qabul qiluvchi:</p>
                  <h3 className="font-black text-sm uppercase text-slate-800">
                    {selectedSeller?.firstName} {selectedSeller?.lastName}
                  </h3>
                </div>
                <div className="bg-white border px-3 py-1.5 rounded-sm shadow-sm">
                  <span className="text-[10px] font-black text-primary uppercase">Savat: {basket.length} ta</span>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                    placeholder="Mahsulot nomi yoki SKU bo'yicha qidirish..."
                    className="pl-10 h-11 rounded-sm border-slate-200"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                {productsLoading ? (
                    [...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-sm" />)
                ) : (
                    products.map((product) => {
                      const isInBasket = basket.some(i => i.product._id === product._id);
                      return (
                          <Card key={product._id} className={`rounded-sm border-slate-200 transition-shadow hover:shadow-md ${isInBasket ? 'bg-slate-50/50 border-primary/30' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-black uppercase text-slate-800 line-clamp-1">{product.name}</p>
                                <Badge className="bg-slate-100 text-slate-500">{product.category.name}</Badge>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">Omborda: {product.count} ta</p>
                              <Button
                                  variant={isInBasket ? "secondary" : "outline"}
                                  className="w-full h-8 rounded-sm text-[10px] font-bold uppercase"
                                  onClick={() => addToBasket(product)}
                                  disabled={product.count === 0}
                              >
                                {isInBasket ? "Qo'shilgan" : "Tanlash"}
                              </Button>
                            </CardContent>
                          </Card>
                      );
                    })
                )}
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="ghost" onClick={() => setStep(1)} className="text-[11px] font-bold uppercase text-slate-500">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Orqaga
                </Button>
                <Button disabled={basket.length === 0} onClick={() => setStep(3)} className="h-10 px-8 rounded-sm font-bold text-[11px] uppercase tracking-wider">
                  Miqdorni belgilash <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
        )}

       
        {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="font-black text-sm uppercase text-slate-800 tracking-wider">Miqdorlarni belgilang</h3>
              <div className="space-y-2">
                {basket.map((item) => (
                    <Card key={item.product._id} className="rounded-sm border-slate-200">
                      <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-sm">
                            <Package size={18} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase text-slate-800">{item.product.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              Maksimal: <span className="text-primary">{item.product.count}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 self-end md:self-center">
                          <div className="flex items-center border border-slate-200 rounded-sm overflow-hidden h-9">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-full rounded-none hover:bg-slate-50"
                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </Button>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 1)}
                                className="w-12 text-center text-xs font-black border-x border-slate-100 focus:outline-none"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-full rounded-none hover:bg-slate-50"
                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.count}
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                          <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-300 hover:text-destructive hover:bg-destructive/5"
                              onClick={() => removeFromBasket(item.product._id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="ghost" onClick={() => setStep(2)} className="text-[11px] font-bold uppercase text-slate-500">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Orqaga
                </Button>
                <Button onClick={() => setStep(4)} className="h-10 px-8 rounded-sm font-bold text-[11px] uppercase tracking-wider">
                  {`Ko'rib chiqish`} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
        )}

        
        {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <Card className="rounded-sm border-primary/20 bg-primary/[0.02] shadow-none">
                <CardHeader className="pb-4 border-b border-primary/10">
                  <CardTitle className="text-sm font-black uppercase text-primary tracking-widest text-center">Transferni tasdiqlang</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center gap-4 p-4 bg-white border rounded-sm">
                    <div className="h-10 w-10 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Qabul qiluvchi sotuvchi</p>
                      <p className="text-xs font-black uppercase text-slate-800">{selectedSeller?.firstName} {selectedSeller?.lastName}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest ml-1">Biriktirilayotgan mahsulotlar</p>
                    <div className="border rounded-sm divide-y bg-white">
                      {basket.map((item) => (
                          <div key={item.product._id} className="p-3 flex justify-between items-center">
                            <p className="text-xs font-bold text-slate-700 uppercase">{item.product.name}</p>
                            <span className="text-xs font-black bg-slate-100 px-2.5 py-1 rounded-sm">{item.quantity} ta</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-800 rounded-sm text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Jami miqdor:</p>
                    <p className="text-lg font-black">{basket.reduce((acc, i) => acc + i.quantity, 0)} ta</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="ghost" onClick={() => setStep(3)} disabled={isPending} className="text-[11px] font-bold uppercase text-slate-500">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Orqaga
                </Button>
                <Button
                    className="h-11 px-10 rounded-sm font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20"
                    onClick={handleConfirm}
                    disabled={isPending}
                >
                  {isPending ? "Biriktirilmoqda..." : "Transferni yakunlash"}
                </Button>
              </div>
            </div>
        )}
      </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-tight ${className}`}>
            {children}
        </span>
  );
}