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
import { FileUp, Download } from "lucide-react";
import { useState, useRef } from "react";
import { useImportProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function ImportProductDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: importProducts, isPending } = useImportProducts();
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

    importProducts(formData, {
      onSuccess: (data: any) => {
        showToast(`Muvaffaqiyatli import qilindi: ${data.importedCount} ta`, "success");
        if (data.skippedCount > 0) {
          showToast(`${data.skippedCount} ta o'tkazib yuborildi (Dublikat)`, "info");
        }
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
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/products/import/template`
    : "http://localhost:5000/api/products/import/template";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 transition-colors">
          <FileUp className="mr-2 h-4 w-4" />
          Excel Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Excel orqali mahsulotlarni import qilish</DialogTitle>
          <DialogDescription>
            .xlsx formatidagi faylni yuklang. Fayl hajmi 10MB dan va qatorlar soni 1000 tadan oshmasligi kerak.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4 !text-blue-800" />
            <AlertTitle className="font-bold">Eslatma!</AlertTitle>
            <AlertDescription className="text-xs leading-5 mt-1">
              <ul className="list-disc pl-4 space-y-1">
                <li><b>Name, Price va Category</b> ustunlarini to'ldirish majburiy.</li>
                <li>Bazada xuddi shu nomdagi yoki SKU idagi mahsulot mavjud bo'lsa, u <b>o'tkazib yuboriladi</b> (dublikat sifatida).</li>
                <li>Yangi kiritilgan kategoriyalar avtomat ravishda yaratiladi.</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center bg-gray-50 border p-3 rounded-md">
            <span className="text-sm font-medium text-gray-700">Namuna fayl (Shablon)</span>
            <Button asChild size="sm" variant="secondary" className="h-8">
              <a href={downloadTemplateURL} download>
                <Download className="mr-2 h-4 w-4" /> Yuklab olish
              </a>
            </Button>
          </div>

          <div className="grid gap-2 mt-2">
            <label htmlFor="excel-file" className="text-sm font-semibold text-gray-700">Excel fayl (.xlsx)</label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-sm file:px-3 file:py-1 file:mr-3 file:text-xs file:font-semibold hover:file:cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
          <Button onClick={handleImport} disabled={!file || isPending} className="bg-emerald-600 hover:bg-emerald-700">
            {isPending ? "Import qilinmoqda..." : "Importni boshlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
