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
import { useCreateSeller } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/useToast";
import { AxiosError } from "axios";

interface SellerFormValues {
  phoneNumber: string;
  firstName: string;
  lastName?: string;
}

export function CreateSellerDialog() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<SellerFormValues>();
  const { mutate: createSeller, isPending } = useCreateSeller();
  const { showToast } = useToast();

  const onSubmit = (data: SellerFormValues) => {
    createSeller(data, {
      onSuccess: () => {
        showToast("Sotuvchi muvaffaqiyatli qo'shildi", "success");
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yangi sotuvchi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Yangi sotuvchi qo&apos;shish</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Telefon raqam</Label>
              <Input 
                id="phoneNumber" 
                placeholder="+998901234567" 
                {...register("phoneNumber", { required: true })} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firstName">Ism</Label>
              <Input id="firstName" {...register("firstName", { required: true })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Familiya (Ixtiyoriy)</Label>
              <Input id="lastName" {...register("lastName")} />
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
