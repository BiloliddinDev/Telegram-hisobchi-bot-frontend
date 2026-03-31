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
import { FileUp, Download, Info, Settings2 } from "lucide-react";
import { useState, useRef } from "react";
import { useImportProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ImportResponse {
  importedCount: number;
  skippedCount: number;
  errorsCount: number;
}

export function ImportProductDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [priceAdjustmentMode, setPriceAdjustmentMode] = useState<string>("FIXED");
  const [priceAdjustmentValue, setPriceAdjustmentValue] = useState<string>("0");
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
    formData.append("priceAdjustmentMode", priceAdjustmentMode);
    formData.append("priceAdjustmentValue", priceAdjustmentValue);

    importProducts(formData, {
      onSuccess: (data: ImportResponse) => {
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

        <div className="flex flex-col gap-5 py-4">
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4 !text-blue-800" />
            <AlertTitle className="font-bold">Eslatma!</AlertTitle>
            <AlertDescription className="text-xs leading-5 mt-1">
              <ul className="list-disc pl-4 space-y-1">
                <li><b>Name, Category va CostPrice</b> ustunlarini to&apos;ldirish majburiy.</li>
                <li><b>Price</b> ustuni bo&apos;sh bo&apos;lsa, u quyidagi sozlamalar asosida <b>CostPrice</b> dan hisoblanadi.</li>
                <li>Bazada xuddi shu nomdagi yoki SKU idagi mahsulot mavjud bo&apos;lsa, u <b>o&apos;tkazib yuboriladi</b> (dublikat sifatida).</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-4 border p-4 rounded-md bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-tighter">
              <Settings2 size={16} className="text-primary" />
              Narxni hisoblash sozlamalari
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adjustment-mode" className="text-xs font-semibold">Hisoblash turi</Label>
                <Select value={priceAdjustmentMode} onValueChange={setPriceAdjustmentMode}>
                  <SelectTrigger id="adjustment-mode" className="h-9 text-xs">
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Qiymat qo&apos;shish ($)</SelectItem>
                    <SelectItem value="PERCENTAGE">Foiz qo&apos;shish (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjustment-value" className="text-xs font-semibold">
                  {priceAdjustmentMode === "FIXED" ? "Qoshiladigan qiymat ($)" : "Qoshiladigan foiz (%)"}
                </Label>
                <Input
                  id="adjustment-value"
                  type="number"
                  step="0.1"
                  min="0"
                  value={priceAdjustmentValue}
                  onChange={(e) => setPriceAdjustmentValue(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
              * Agar Excelda narx (Price) ko&apos;rsatilgan bo&apos;lsa, ushbu sozlama inobatga olinmaydi.
            </p>
          </div>

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
