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
import { FileUp, Download, Info, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useImportTransfers } from "@/hooks/useTransfers";
import { useSellers } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/useToast";
import { User } from "@/interface/User.type";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImportTransferDialogProps {
  sellerIdentifier?: string; // Optional seller's ID, username or phone
  sellerName?: string;
}

interface ImportResponse {
  success: boolean;
  message: string;
  successCount: number;
  failedCount: number;
  details: {
    errors: Array<{ row: number; message: string }>;
  };
}

export function ImportTransferDialog({ sellerIdentifier, sellerName }: ImportTransferDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [localSellerId, setLocalSellerId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: importTransfers, isPending } = useImportTransfers();
  const { data: sellers = [] } = useSellers();
  const { showToast } = useToast();

  useEffect(() => {
    if (sellerIdentifier) {
      setLocalSellerId(sellerIdentifier);
    }
  }, [sellerIdentifier, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!localSellerId) {
      showToast("Iltimos, sotuvchini tanlang", "error");
      return;
    }
    if (!file) {
      showToast("Iltimos, fayl tanlang", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sellerIdentifier", localSellerId);

    importTransfers(formData, {
      onSuccess: (data: ImportResponse) => {
        showToast(
          `Muvaffaqiyatli biriktirildi: ${data.successCount} ta SKU`,
          "success"
        );

        if (data.failedCount > 0) {
          showToast(
            `${data.failedCount} ta qatorda xatolik yuz berdi.`,
            "error"
          );
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
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/transfers/template`
    : "http://localhost:5000/api/transfers/template";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 transition-colors font-bold text-xs uppercase tracking-wider">
          <FileUp className="mr-2 h-4 w-4" />
          Excel Biriktirish
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px] rounded-sm">
        <DialogHeader>
          <DialogTitle className="uppercase font-black tracking-tight text-xl">
            Sotuvchiga ommaviy biriktirish
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-slate-400 uppercase">
            Excel orqali mahsulotlarni sotuvchiga o&apos;tkazish
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          {!sellerIdentifier ? (
            <div className="space-y-2">
              <Label htmlFor="seller-select" className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Sotuvchini tanlang</Label>
              <Select value={localSellerId} onValueChange={setLocalSellerId}>
                <SelectTrigger id="seller-select" className="h-11 rounded-sm border-slate-200">
                  <SelectValue placeholder="Sotuvchini tanlash..." />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller: User) => (
                    <SelectItem key={seller._id} value={seller._id}>
                      {seller.firstName} {seller.lastName} (@{seller.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="bg-slate-50 border p-3 rounded-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qabul qiluvchi:</p>
              <p className="text-xs font-black uppercase text-primary">{sellerName} <span className="opacity-50">(@{sellerIdentifier})</span></p>
            </div>
          )}
          <Alert className="bg-blue-50 text-blue-800 border-blue-200 rounded-sm">
            <Info className="h-4 w-4 !text-blue-800" />
            <AlertTitle className="font-black uppercase text-xs tracking-widest">Excel Schema Tushuntirishi</AlertTitle>
            <AlertDescription className="text-[11px] leading-5 mt-1 font-bold">
              <ul className="list-disc pl-4 space-y-1">
                <li><b>Mahsulot SKU (Majburiy)</b>: Omborda mavjud bo&apos;lgan mahsulotning SKU kodi.</li>
                <li><b>Miqdor (Majburiy)</b>: Sotuvchiga o&apos;tkaziladigan mahsulot soni.</li>
              </ul>
              <p className="mt-2 text-blue-600 italic">
                * Tizim avtomatik ravishda ombordagi qoldiqni tekshiradi va sotuvchi zaxirasiga qo&apos;shadi.
              </p>
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center bg-slate-50 border p-4 rounded-sm">
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase text-slate-700">Namuna fayl (Shablon)</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">To&apos;g&apos;ri format uchun yuklab oling</span>
            </div>
            <Button asChild size="sm" variant="secondary" className="h-9 rounded-sm font-black uppercase text-[10px] tracking-wider transition-all hover:shadow-md">
              <a href={downloadTemplateURL} download>
                <Download className="mr-2 h-4 w-4" /> Yuklab olish
              </a>
            </Button>
          </div>

          <div className="grid gap-3">
            <label htmlFor="transfer-excel-file" className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Excel fayl (.xlsx)</label>
            <Input
              id="transfer-excel-file"
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-sm file:px-3 file:py-1 file:mr-3 file:text-[10px] file:font-black file:uppercase file:cursor-pointer transition-all hover:border-primary/50"
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 border border-green-100 rounded-sm">
              <CheckCircle2 size={16} />
              <span className="text-[11px] font-black uppercase">{file.name} tanlandi</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-sm font-black uppercase text-[11px]">
            Bekor qilish
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isPending}
            className="bg-blue-600 hover:bg-blue-700 rounded-sm font-black uppercase text-[11px] min-w-[140px]"
          >
            {isPending ? "Yuborilmoqda..." : "Biriktirishni boshlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
