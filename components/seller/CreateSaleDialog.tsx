"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { useCreateSale } from "@/hooks/useSales";
import { useToast } from "@/hooks/useToast";
import { AxiosError } from "axios";

interface SaleFormValues {
  quantity: number;
  customerName?: string;
  customerPhone?: string;
  price: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

export function CreateSaleDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<SaleFormValues>({
    defaultValues: {
      price: product.price
    }
  });
  const { mutate: createSale, isPending } = useCreateSale();
  const { showToast } = useToast();

  const onSubmit = (data: SaleFormValues) => {
    createSale({ 
      productId: product._id, 
      ...data 
    }, {
      onSuccess: () => {
        showToast("Savdo muvaffaqiyatli amalga oshirildi", "success");
        setOpen(false);
        reset();
      },
      onError: (error: unknown) => {
        const axiosError = error as AxiosError<{ error: string }>;
        showToast(axiosError.response?.data?.error || "Xatolik yuz berdi", "error");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Sotish</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Mahsulot sotish</DialogTitle>
            <CardDescription>{product.name}</CardDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Miqdor</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register("quantity", { required: true, valueAsNumber: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Sotish narxi (dona uchun)</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { required: true, valueAsNumber: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerName">Mijoz ismi (Ixtiyoriy)</Label>
              <Input id="customerName" {...register("customerName")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerPhone">Mijoz telefoni (Ixtiyoriy)</Label>
              <Input id="customerPhone" {...register("customerPhone")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sotilmoqda..." : "Sotish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
