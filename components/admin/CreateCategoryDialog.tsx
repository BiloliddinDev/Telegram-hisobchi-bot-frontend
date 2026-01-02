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
import { useCreateCategory } from "@/hooks/useProducts";
import { useToast } from "@/hooks/useToast";
import { AxiosError } from "axios";

interface CategoryFormValues {
  name: string;
}

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<CategoryFormValues>();
  const { mutate: createCategory, isPending } = useCreateCategory();
  const { showToast } = useToast();

  const onSubmit = (data: CategoryFormValues) => {
    createCategory(data, {
      onSuccess: () => {
        showToast("Kategoriya muvaffaqiyatli qo'shildi", "success");
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
        <Button variant="outline" className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          Kategoriya
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Yangi kategoriya qo&apos;shish</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cat-name">Nomi</Label>
              <Input id="cat-name" {...register("name", { required: true })} />
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
