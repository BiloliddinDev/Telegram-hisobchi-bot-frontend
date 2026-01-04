/* eslint-disable react/no-unescaped-entities */
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
import { useUpdateSeller } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/useToast";
import { User } from "@/interface/User.type"
import axios from "axios";

interface EditSellerDialogProps {
  seller: User;
}

interface SellerFormValues {
  phoneNumber: string;
  username?: string;
  firstName: string;
  lastName?: string;
  isActive: boolean;
}

export function EditSellerDialog({ seller }: EditSellerDialogProps) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useForm<SellerFormValues>({
    defaultValues: {
      phoneNumber: seller.phoneNumber,
      username: seller.username,
      firstName: seller.firstName,
      lastName: seller.lastName,
      isActive: seller.isActive,
    },
  });
  const { mutate: updateSeller, isPending } = useUpdateSeller();
  const { showToast } = useToast();

  const onSubmit = (data: SellerFormValues) => {
    updateSeller(
      { id: seller._id, data },
      {
        onSuccess: () => {
          showToast("Sotuvchi ma'lumotlari yangilandi", "success");
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
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Tahrirlash
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Sotuvchini tahrirlash</DialogTitle>
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
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firstName">Ism</Label>
              <Input id="firstName" {...register("firstName", { required: true })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Familiya</Label>
              <Input id="lastName" {...register("lastName")} />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                {...register("isActive")}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isActive">Faol holatda</Label>
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
