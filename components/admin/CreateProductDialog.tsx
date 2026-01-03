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
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCreateProduct, useCategories } from "@/hooks/useProducts";
import { useToast } from "@/hooks/useToast";
import { Category } from "@/interface/category.type";
import { ProductCreateInput } from "@/interface/products.type";
import axios from "axios";

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  costPrice: number;
  category: string;
  stock: number;
  sku: string;
  color: string;
}

export function CreateProductDialog() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<ProductFormValues>();
  const { mutate: createProduct, isPending } = useCreateProduct();
  const { data: categories = [] } = useCategories();
  const { showToast } = useToast();

  const onSubmit = (data: ProductFormValues) => {
    // Map form values to ProductCreateInput
    const productData: ProductCreateInput = {
      name: data.name,
      description: data.description,
      price: data.price,
      costPrice: data.costPrice,
      category: data.category, // This is already a string (category ID)
      stock: data.stock,
      sku: data.sku,
      color: data.color,
    };

    createProduct(productData, {
      onSuccess: () => {
        showToast("Mahsulot muvaffaqiyatli qo'shildi", "success");
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
        <Button className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          Mahsulot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Yangi mahsulot qo&apos;shish</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nomi</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Tavsif</Label>
              <Input id="description" {...register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="costPrice">Tan narxi</Label>
                <Input
                  id="costPrice"
                  type="number"
                  {...register("costPrice", { required: true, valueAsNumber: true })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Sotuv narxi</Label>
                <Input
                  id="price"
                  type="number"
                  {...register("price", { required: true, valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU / Maxsus nom</Label>
                <Input id="sku" {...register("sku")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Rang</Label>
                <Input id="color" {...register("color")} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Kategoriya</Label>
              <select
                id="category"
                {...register("category", { required: true })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Tanlang...</option>
                {categories.map((cat: Category) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
                {categories.length === 0 && <option value="general">Umumiy</option>}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock">Ombordagi miqdor</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", { required: true, valueAsNumber: true })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Qo'shilmoqda..." : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
