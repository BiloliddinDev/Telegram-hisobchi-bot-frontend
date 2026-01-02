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
import { useAssignProduct, useSellers } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/useToast";
import { Product } from "@/interface/products.type";
import { Seller } from "@/interface/seller.type";
import axios from "axios";

interface AssignFormValues {
  sellerId: string;
  quantity: number;
}

export function AssignProductDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<AssignFormValues>();
  const { mutate: assignProduct, isPending } = useAssignProduct();
  const { data: sellers = [] } = useSellers();
  const { showToast } = useToast();

  const onSubmit = (data: AssignFormValues) => {
    assignProduct({ 
      productId: product._id, 
      sellerId: data.sellerId, 
      quantity: data.quantity 
    }, {
      onSuccess: () => {
        showToast("Mahsulot muvaffaqiyatli biriktirildi", "success");
        setOpen(false);
        reset();
      },
      onError: (error: unknown) => {
        let errorMessage = "Xatolik yuz berdi";
        if (axios.isAxiosError<{ error: string }>(error)) {
          errorMessage = error.response?.data?.error || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        showToast(errorMessage, "error");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Biriktirish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Mahsulotni biriktirish</DialogTitle>
            <CardDescription>{product.name}</CardDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sellerId">Sotuvchi</Label>
              <select 
                id="sellerId" 
                {...register("sellerId", { required: true })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Tanlang...</option>
                {sellers.map((seller: Seller) => (
                  <option key={seller._id} value={seller._id}>
                    {seller.firstName} {seller.lastName} (@{seller.username})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Miqdor (Ombordan olinadi)</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock}
                {...register("quantity", { required: true, valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">Max: {product.stock}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Biriktirilmoqda..." : "Biriktirish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
