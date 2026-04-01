"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Database, Download, Info } from "lucide-react";
import { useState, useRef } from "react";
import { useImportWarehouseQuantity } from "@/hooks/useProducts";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WarehouseUpdateResponse {
  updatedCount: number;
  errorsCount: number;
}

export function ImportWarehouseQuantityDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: updateQuantities, isPending } = useImportWarehouseQuantity();
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) {
      showToast("Iltimos, fayl tanlang", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    updateQuantities(formData, {
      onSuccess: (data: WarehouseUpdateResponse) => {
        showToast(`Muvaffaqiyatli yangilandi: ${data.updatedCount} ta SKU`, "success");
        if (data.errorsCount > 0) {
          showToast(`${data.errorsCount} ta xatolik topildi`, "error");
        }
        setOpen(false);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
    });
  };

  const downloadTemplateURL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/products/warehouse/template`
    : "http://localhost:5000/api/products/warehouse/template";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 transition-colors">
          <Database className="mr-2 h-4 w-4" />
          Ombor Yangilash
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ombor qoldig&apos;ini Excel orqali yangilash</DialogTitle>
          <DialogDescription>
            SKU bo&apos;yicha qoldiklarni ommaviy yangilash uchun .xlsx faylini yuklang.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <Info className="h-4 w-4 !text-amber-800" />
            <AlertTitle className="font-bold">Ustunlar va Statuslar</AlertTitle>
            <AlertDescription className="text-xs leading-5 mt-1">
              <ul className="list-disc pl-4 space-y-1">
                <li><b>SKU</b>: Mahsulotning maxsus kodi (bazada bo&apos;lishi shart).</li>
                <li><b>Quantity</b>: Musbat miqdor (masalan: 10).</li>
                <li><b>Status</b>: O&apos;zgarish turi:
                  <ul className="list-circle pl-4 mt-1 space-y-1">
                    <li><code className="bg-amber-100 px-1 rounded">INC</code>: <b>Oshirish</b> - mavjud qoldiqqa qo&apos;shiladi.</li>
                    <li><code className="bg-amber-100 px-1 rounded">DEC</code>: <b>Kamaytirish</b> - qoldiqdan ayiriladi (0 dan kamaymaydi).</li>
                    <li><code className="bg-amber-100 px-1 rounded">SET</code>: <b>O&apos;rnatish</b> - qoldiqni aynan shu songa o&apos;zgartiradi.</li>
                  </ul>
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center bg-gray-50 border p-3 rounded-md">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Namuna fayl (Shablon)</span>
              <span className="text-[10px] text-gray-500">To&apos;g&apos;ri formatni ko&apos;rish uchun yuklab oling</span>
            </div>
            <Button asChild size="sm" variant="secondary" className="h-8">
              <a href={downloadTemplateURL} download>
                <Download className="mr-2 h-4 w-4" /> Yuklab olish
              </a>
            </Button>
          </div>

          <div className="grid gap-2 mt-2">
            <label htmlFor="warehouse-excel-file" className="text-sm font-semibold text-gray-700">Excel fayl (.xlsx)</label>
            <Input
              id="warehouse-excel-file"
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="file:bg-blue-600 file:text-white file:border-0 file:rounded-sm file:px-3 file:py-1 file:mr-3 file:text-xs file:font-semibold hover:file:cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
          <Button onClick={handleImport} disabled={!file || isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isPending ? "Yangilanmoqda..." : "Yangilashni boshlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
