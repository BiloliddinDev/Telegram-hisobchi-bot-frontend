"use client";

import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface CheckoutFormValues {
  customerName: string;
  customerPhone: string;
  notes: string;
  paidAmount: string;
  dueDate: Date | undefined;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  totalAmount: number; // Savatdagi mahsulotlar yig'indisi (masalan: 59.52)
  discount: number; // Chegirma foizi (masalan: 4)
  discountAmount: number; // Chegirma summasi (masalan: 2.48)
  isSelling: boolean;
}

export default function CheckoutModal({
  open,
  onClose,
  onSubmit,
  totalAmount,
  discount,
  discountAmount,
  isSelling,
}: Props) {
  const [activeTab, setActiveTab] = useState<"naqd" | "nasiya">("naqd");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      customerName: "",
      customerPhone: "+998",
      notes: "",
      paidAmount: "0",
      dueDate: undefined,
    },
  });

  const paidAmountStr = useWatch({ control, name: "paidAmount" });
  const selectedDueDate = useWatch({ control, name: "dueDate" });

  // --- MATEMATIK HISOB-KITOB ---
  // 1. Haqiqiy to'lanishi kerak bo'lgan summa (Netto)
  // Masalan: 59.52 - 2.48 = 57.04
  const netTotal = Number((totalAmount - discountAmount).toFixed(2));

  // 2. Mijoz kiritayotgan pul (Inputdagi qiymat)
  const paidAmountValue = parseFloat(paidAmountStr) || 0;

  // 3. Qarzni aniq hisoblash
  // 57.04 - 57.04 = 0 (Precision errorlarsiz)
  const currentDebt = Math.max(
    0,
    Number((netTotal - paidAmountValue).toFixed(2)),
  );

  // Tab o'zgarganda yoki summa o'zgarganda inputni to'ldirish
  useEffect(() => {
    clearErrors();
    if (activeTab === "naqd") {
      // Naqd bo'lsa, to'lanadigan summa avtomat 57.04 bo'ladi
      setValue("paidAmount", netTotal.toString());
      setValue("dueDate", undefined);
    } else {
      // Nasiya tanlansa, mijoz qancha berganini o'zi yozadi
      setValue("paidAmount", "0");
    }
  }, [activeTab, netTotal, setValue, clearErrors, open]);

  const onInternalSubmit = (data: CheckoutFormValues) => {
    if (activeTab === "nasiya") {
      if (!data.dueDate) {
        setError("dueDate", {
          type: "manual",
          message: "Muddat tanlash majburiy!",
        });
        return;
      }
      if (!data.customerName) {
        setError("customerName", {
          type: "manual",
          message: "Mijoz ismini kiriting!",
        });
        return;
      }
    }

    // Backendga yuboriladigan yakuniy ma'lumotlar
    onSubmit({
      ...data,
      totalAmount: netTotal, // BU ENG MUHIMI: Chegirma ayirilgan summani JAMI deb yuboramiz
      paidAmount: Number(Number(data.paidAmount).toFixed(2)),
      debt: currentDebt, // Endi bu yerda kutilmagan qarz chiqmaydi
      discount: Number(discountAmount.toFixed(2)),
      discountPercent: discount,
      isNasiya: activeTab === "nasiya" || currentDebt > 0,
    });

    handleClose();
  };

  const handleClose = () => {
    reset();
    setActiveTab("naqd");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Savdoni yakunlash
          </DialogTitle>
        </DialogHeader>

        {/* To'lov Ma'lumotlari Paneli */}
        <div className="rounded-lg border bg-slate-50 p-4 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            To'lanishi kerak bo'lgan summa
          </span>
          <div className="text-4xl font-black text-slate-900">
            {netTotal.toLocaleString()}{" "}
            <span className="text-xl font-normal text-slate-500">$</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-green-600">
              <span className="line-through text-slate-400">
                {totalAmount.toLocaleString()} $
              </span>
              <span>(-{discountAmount.toLocaleString()} $)</span>
            </div>
          )}
        </div>

        {/* To'lov turi (Tabs) */}
        <div className="flex p-1 bg-slate-100 rounded-md mt-4">
          {(["naqd", "nasiya"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded",
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit(onInternalSubmit)}
          className="space-y-4 mt-6"
        >
          <div className="space-y-4">
            {/* Mijoz Ismi */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                Mijoz Ismi
              </label>
              <Input
                {...register("customerName")}
                placeholder="Ali Valiyev"
                className={cn(
                  errors.customerName &&
                    "border-red-500 focus-visible:ring-red-500",
                )}
              />
              {errors.customerName && (
                <p className="text-[10px] text-red-500 font-bold">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            {/* Telefon */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                Telefon
              </label>
              <Input {...register("customerPhone")} placeholder="+998" />
            </div>

            {/* To'lov va Qarz Bloklari */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  To'langan
                </label>
                <Input
                  {...register("paidAmount")}
                  type="number"
                  step="0.01"
                  className="font-bold text-blue-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Qarz
                </label>
                <div
                  className={cn(
                    "h-10 flex items-center px-3 border rounded-md font-bold text-sm",
                    currentDebt > 0
                      ? "bg-red-50 text-red-600 border-red-100"
                      : "bg-green-50 text-green-600 border-green-100",
                  )}
                >
                  {currentDebt.toLocaleString()} $
                </div>
              </div>
            </div>

            {/* Muddat (Faqat nasiya uchun) */}
            {activeTab === "nasiya" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  To'lov Muddati
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start font-medium",
                        !selectedDueDate && "text-slate-400",
                        errors.dueDate && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDueDate
                        ? format(selectedDueDate, "dd-MM-yyyy")
                        : "Sanani tanlang"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDueDate}
                      onSelect={(date) => {
                        setValue("dueDate", date);
                        clearErrors("dueDate");
                      }}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dueDate && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.dueDate.message}
                  </p>
                )}
              </div>
            )}

            {/* Izoh */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                Izoh
              </label>
              <Input {...register("notes")} placeholder="Ixtiyoriy..." />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSelling}
            className="w-full h-12 text-sm font-bold uppercase tracking-widest shadow-lg active:scale-[0.98]"
          >
            {isSelling ? "Yuborilmoqda..." : "Savdoni tasdiqlash"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
