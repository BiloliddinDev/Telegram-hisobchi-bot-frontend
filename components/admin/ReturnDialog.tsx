"use client";

import { useEffect, useState } from "react";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { GroupedOrder, OrderItem } from "@/interface/sale.type";
import { ReturnType } from "@/interface/return.type";
import { useReturn } from "@/hooks/useReturn";

interface ItemState {
  saleId: string;
  productName: string;
  maxQty: number;
  price: number;
  selected: boolean;
  quantity: number;
}

interface Props {
  order: GroupedOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReturnDialog({ order, open, onOpenChange }: Props) {
  const [items, setItems] = useState<ItemState[]>([]);
  const [returnType, setReturnType] = useState<ReturnType>("cash");

  const { mutateAsync, isPending } = useReturn();

  useEffect(() => {
    if (order && open) {
      setItems(
        order.items.map((item: OrderItem) => ({
          saleId: item._id,
          productName: item.product.name,
          maxQty: item.quantity,
          price: item.price,
          selected: true,
          quantity: item.quantity,
        })),
      );
      setReturnType("cash");
    }
  }, [order, open]);

  if (!order) return null;

  const daysSince = differenceInDays(new Date(), new Date(order.timestamp));
  const isExpired = !order.isCustomer && daysSince > 7;
  const isReturned = order.status === "returned";

  const selectedItems = items.filter((i) => i.selected && i.quantity > 0);
  const totalBack = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const toggleItem = (saleId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.saleId === saleId ? { ...i, selected: !i.selected } : i)),
    );
  };

  const changeQty = (saleId: string, value: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.saleId !== saleId) return i;
        return { ...i, quantity: Math.max(1, Math.min(value, i.maxQty)) };
      }),
    );
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Kamida bitta mahsulot tanlang");
      return;
    }
    try {
      const result = await mutateAsync({
        orderId: order.orderId,
        returnType,
        items: selectedItems.map((i) => ({ saleId: i.saleId, quantity: i.quantity })),
      });
      toast.success(result.message);
      if (result.cashBack > 0)
        toast.info(`Naqd qaytarildi: ${result.cashBack.toLocaleString()} $`);
      if (result.debtReduced > 0)
        toast.info(`Qarz kamaytildi: ${result.debtReduced.toLocaleString()} $`);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      toast.error(msg || "Xatolik yuz berdi");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tovarni qaytarish</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mijoz turi */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {order.customerName || "Noma'lum mijoz"}
            </span>
            <Badge variant={order.isCustomer ? "default" : "secondary"}>
              {order.isCustomer ? "Doimiy mijoz" : "Bir martalik"}
            </Badge>
          </div>

          {/* Already returned */}
          {isReturned && (
            <Alert variant="destructive">
              <AlertDescription>Bu order allaqachon qaytarilgan.</AlertDescription>
            </Alert>
          )}

          {/* 7 kunlik limit (bir martalik mijoz) */}
          {!isReturned && !order.isCustomer && (
            <Alert variant={isExpired ? "destructive" : "default"}>
              <AlertDescription>
                {isExpired
                  ? `Qaytarish muddati o'tdi — sotuvdan ${daysSince} kun o'tgan (limit: 7 kun).`
                  : `Bir martalik mijoz. Qaytarish uchun ${7 - daysSince} kun qoldi.`}
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Qaytarish turi — faqat doimiy mijozlarda */}
          {order.isCustomer && (
            <div className="space-y-2">
              <Label>Qaytarish turi</Label>
              <RadioGroup
                value={returnType}
                onValueChange={(v: string) => setReturnType(v as ReturnType)}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cash" id="rt-cash" />
                  <Label htmlFor="rt-cash">Naqd pul</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="debt" id="rt-debt" />
                  <Label htmlFor="rt-debt">Qarzdan ayirish</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <Separator />

          {/* Mahsulotlar */}
          <div className="space-y-2">
            <Label>Mahsulotlar</Label>
            {items.map((item) => (
              <div
                key={item.saleId}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={item.saleId}
                    checked={item.selected}
                    onCheckedChange={() => toggleItem(item.saleId)}
                    disabled={isReturned || isExpired}
                  />
                  <label htmlFor={item.saleId} className="cursor-pointer">
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.price.toLocaleString()} $ / dona
                    </p>
                  </label>
                </div>

                {item.selected && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => changeQty(item.saleId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => changeQty(item.saleId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxQty}
                    >
                      +
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Xulosa */}
          {selectedItems.length > 0 && !isReturned && !isExpired && (
            <>
              <Separator />
              <div className="space-y-1 text-sm">
                {returnType === "cash" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Naqd qaytariladi:</span>
                    <span className="font-semibold text-green-600">
                      {totalBack.toLocaleString()} $
                    </span>
                  </div>
                )}
                {returnType === "debt" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Qarzdan ayiriladi:</span>
                    <span className="font-semibold text-blue-600">
                      {totalBack.toLocaleString()} $
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || isExpired || isReturned || selectedItems.length === 0}
          >
            {isPending ? "Yuborilmoqda..." : "Qaytarishni tasdiqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
