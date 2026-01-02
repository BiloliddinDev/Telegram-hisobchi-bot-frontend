"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSellers } from "@/hooks/useAdminData";
import { useProducts } from "@/hooks/useProducts";
import { useCreateTransfer } from "@/hooks/useTransfers";
import { useToast } from "@/hooks/useToast";
import { Seller } from "@/interface/seller.type";
import { Product } from "@/interface/products.type";
import { Search, Plus, Minus, Trash2, CheckCircle2, ChevronRight, ChevronLeft, User as UserIcon } from "lucide-react";
import { AxiosError } from "axios";

export function StockTransferModule() {
  const [step, setStep] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [basket, setBasket] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const { data: sellers = [] } = useSellers();
  const { data: products = [] } = useProducts();
  const { mutate: createTransfer, isPending } = useCreateTransfer();
  const { showToast } = useToast();

  const filteredSellers = sellers.filter(s => 
    `${s.firstName} ${s.lastName} ${s.username}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku?.toLowerCase().includes(productSearch.toLowerCase())
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
    setBasket(basket.map(item => {
      if (item.product._id === productId) {
        const max = item.product.stock;
        const newQty = Math.max(1, Math.min(qty, max));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleConfirm = () => {
    if (!selectedSeller || basket.length === 0) return;

    createTransfer({
      sellerId: selectedSeller._id,
      items: basket.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }))
    }, {
      onSuccess: () => {
        showToast("Muvaffaqiyatli biriktirildi", "success");
        setStep(1);
        setSelectedSeller(null);
        setBasket([]);
      },
      onError: (error: unknown) => {
        const axiosError = error as AxiosError<{ error: string }>;
        showToast(axiosError.response?.data?.error || "Xatolik yuz berdi", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Stepper Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded-lg overflow-x-auto">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= s ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"
            } font-bold text-sm`}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            <span className={`ml-2 text-sm font-medium whitespace-nowrap ${step === s ? "text-primary" : "text-muted-foreground"}`}>
              {s === 1 && "Sotuvchi"}
              {s === 2 && "Mahsulotlar"}
              {s === 3 && "Miqdor"}
              {s === 4 && "Tasdiqlash"}
            </span>
            {s < 4 && <ChevronRight className="mx-4 text-muted-foreground/30 w-4 h-4" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Seller */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Sotuvchini qidirish..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {filteredSellers.map((seller) => (
              <Card 
                key={seller._id} 
                className={`cursor-pointer transition-all hover:border-primary/50 ${selectedSeller?._id === seller._id ? "border-primary bg-primary/5" : ""}`}
                onClick={() => setSelectedSeller(seller)}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                    {seller.firstName?.[0]}{seller.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{seller.firstName} {seller.lastName}</p>
                    <p className="text-sm text-muted-foreground">@{seller.username}</p>
                  </div>
                  {selectedSeller?._id === seller._id && <CheckCircle2 className="text-primary w-6 h-6" />}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button disabled={!selectedSeller} onClick={() => setStep(2)}>
              Keyingi <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Products */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Sotuvchi: {selectedSeller?.firstName} {selectedSeller?.lastName}</h3>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              Savatda: {basket.length} ta
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Mahsulotlarni qidirish..." 
              className="pl-10"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold truncate">{product.name}</p>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">{product.category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Omborda: {product.stock} ta</p>
                  <Button 
                    variant={basket.find(i => i.product._id === product._id) ? "secondary" : "outline"} 
                    className="w-full"
                    onClick={() => addToBasket(product)}
                    disabled={product.stock === 0}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Qo&apos;shish
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Orqaga
            </Button>
            <Button disabled={basket.length === 0} onClick={() => setStep(3)}>
              Keyingi <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Set Quantity */}
      {step === 3 && (
        <div className="space-y-6">
          <h3 className="font-bold text-lg">Miqdorlarni belgilang</h3>
          <div className="space-y-4">
            {basket.map((item) => (
              <Card key={item.product._id}>
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Omborda bor: <span className="font-medium text-foreground">{item.product.stock} dona</span></p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border rounded-lg">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 1)}
                        className="w-16 border-0 text-center focus-visible:ring-0"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFromBasket(item.product._id)}>
                      <Trash2 className="h-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Orqaga
            </Button>
            <Button onClick={() => setStep(4)}>
              Ko&apos;rib chiqish <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Transferni tasdiqlang</CardTitle>
              <CardDescription>Barcha ma&apos;lumotlar to&apos;g&apos;riligini tekshiring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-background rounded-lg border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="text-primary h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sotuvchi</p>
                  <p className="font-bold">{selectedSeller?.firstName} {selectedSeller?.lastName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Mahsulotlar ro&apos;yxati</p>
                <div className="border rounded-lg divide-y bg-background">
                  {basket.map((item) => (
                    <div key={item.product._id} className="p-3 flex justify-between items-center">
                      <p className="font-medium">{item.product.name}</p>
                      <span className="font-bold bg-secondary px-2 py-0.5 rounded">{item.quantity} ta</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-sm font-medium text-muted-foreground">Jami mahsulotlar soni:</p>
                <p className="text-lg font-bold">{basket.reduce((acc, i) => acc + i.quantity, 0)} ta</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(3)} disabled={isPending}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Orqaga
            </Button>
            <Button className="px-8" onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Biriktirilmoqda..." : "Biriktirishni tasdiqlash"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
