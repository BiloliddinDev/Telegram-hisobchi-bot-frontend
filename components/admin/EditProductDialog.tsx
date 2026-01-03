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
import { Edit } from "lucide-react";
import { useState } from "react";
import { useUpdateProduct, useCategories } from "@/hooks/useProducts";
import { useToast } from "@/hooks/useToast";
import { Product, ProductUpdateInput } from "@/interface/products.type";
import { Category } from "@/interface/category.type";
import axios from "axios";

interface EditProductDialogProps {
  product: Product;
}

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

export function EditProductDialog({ product }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useForm<ProductFormValues>({
    defaultValues: {
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      category: product.category._id,
      stock: product.count,
      sku: product.sku,
      color: product.color,
    }
  });

  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const { data: categories = [] } = useCategories();
  const { showToast } = useToast();

  const onSubmit = (data: ProductFormValues) => {
    // Map form values to ProductUpdateInput
    const productData: ProductUpdateInput = {
      name: data.name,
      description: data.description,
      price: data.price,
      costPrice: data.costPrice,
      category: data.category, // This is already a string (category ID)
      count: data.stock, // Map stock to count
      sku: data.sku,
      color: data.color,
    };

    updateProduct({ id: product._id, data: productData }, {
      onSuccess: () => {
        showToast("Mahsulot muvaffaqiyatli tahrirlandi", "success");
        setOpen(false);
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
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Mahsulotni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nomi</Label>
              <Input id="edit-name" {...register("name", { required: true })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Tavsif</Label>
              <Input id="edit-description" {...register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-costPrice">Tan narxi</Label>
                <Input
                  id="edit-costPrice"
                  type="number"
                  {...register("costPrice", { required: true, valueAsNumber: true })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Sotuv narxi</Label>
                <Input
                  id="edit-price"
                  type="number"
                  {...register("price", { required: true, valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-sku">SKU / Maxsus nom</Label>
                <Input id="edit-sku" {...register("sku")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-color">Rang</Label>
                <Input id="edit-color" {...register("color")} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Kategoriya</Label>
              <select
                id="edit-category"
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
              <Label htmlFor="edit-stock">Ombordagi miqdor</Label>
              <Input
                id="edit-stock"
                type="number"
                {...register("stock", { required: true, valueAsNumber: true })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
