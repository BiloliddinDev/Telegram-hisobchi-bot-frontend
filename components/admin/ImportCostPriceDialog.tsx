"use client";

import React, {useState, useRef, useCallback} from "react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {TrendingUp, Download, Info} from "lucide-react";
import {useUpdateCostPrices, useCheckDuplicates} from "@/hooks/useProducts";
import {useToast} from "@/hooks/useToast";
import axios from "axios";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";

interface CostUpdateResponse {
    updatedCount: number;
    errorsCount: number;
    details?: { errors: { row: number; message: string }[] };
}

export function ImportCostPriceDialog() {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<"percent" | "add">("add");
    const [percent, setPercent] = useState("25");
    const [addAmount, setAddAmount] = useState("3");
    const fileInputRef = useRef<HTMLInputElement>(null);

    type Duplicate = {
        sku: string;
        rows: number[];
        excelCostPrice: number | null;
        excelSellerPrice: number | null;
        warehouseQuantity: number | null;
    };
    const [duplicates, setDuplicates] = useState<Duplicate[]>([]);

    const {mutate: updateCosts, isPending} = useUpdateCostPrices();
    const {mutate: checkDuplicates} = useCheckDuplicates();
    const {showToast} = useToast();

    const runDuplicateCheck = useCallback((selectedFile: File) => {
        const fd = new FormData();
        fd.append("file", selectedFile);
        checkDuplicates(fd, {
            onSuccess: (data) => setDuplicates(data.duplicates),
            onError: () => setDuplicates([]),
        });
    }, [checkDuplicates]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        setFile(selected);
        setDuplicates([]);
        if (selected) runDuplicateCheck(selected);
    };

    const handleImport = () => {
        if (!file) {
            showToast("Iltimos, fayl tanlang", "error");
            return;
        }
        if (mode === "percent" && Number(percent) < 0) {
            showToast("Foiz musbat son bo'lishi kerak", "error");
            return;
        }
        if (mode === "add" && Number(addAmount) < 0) {
            showToast("Qo'shiladigan qiymat musbat bo'lishi kerak", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("mode", mode);
        if (mode === "percent") formData.append("percent", percent);
        if (mode === "add") formData.append("addAmount", addAmount);

        updateCosts(formData, {
            onSuccess: (data: CostUpdateResponse) => {
                showToast(
                    `Muvaffaqiyatli yangilandi: ${data.updatedCount} ta mahsulot`,
                    "success"
                );
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
        ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/products/costs/template`
        : "http://localhost:5000/api/products/costs/template";




    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex-1 border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 transition-colors"
                >
                    <TrendingUp className="mr-2 h-4 w-4"/>
                    Tan Narx Yangilash
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tan narxni Excel orqali yangilash</DialogTitle>
                    <DialogDescription>
                        SKU kodi bo&apos;yicha tan narx va sotuv narxini ommaviy yangilash.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                        <Info className="h-4 w-4 !text-amber-800"/>
                        <AlertTitle className="font-bold">Excel ustunlari</AlertTitle>
                        <AlertDescription className="text-xs leading-5 mt-1">
                            <ul className="list-disc pl-4 space-y-1">
                                <li><b>SKU</b>: Mahsulot kodi — majburiy.</li>
                                <li><b>TanNarx</b>: Yangi tan narxi ($) — majburiy.</li>
                                <li><b>SotuvNarxi</b>: Ixtiyoriy — to&apos;ldirilsa, sozlamadan ustun turadi.</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Sotuv narxini qanday belgilash?</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={mode === "add" ? "default" : "outline"}
                                size="sm"
                                className={`flex-1 ${mode === "add" ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                                onClick={() => setMode("add")}
                            >
                                Qiymat qo&apos;shish ($)
                            </Button>
                            <Button
                                type="button"
                                variant={mode === "percent" ? "default" : "outline"}
                                size="sm"
                                className={`flex-1 ${mode === "percent" ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                                onClick={() => setMode("percent")}
                            >
                                Foizda (%)
                            </Button>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <Label className="text-xs text-amber-700">
                                        {mode === "add" ? "Tan narxga qo'shiladigan qiymat ($)" : "Tan narxga qo'shiladigan foiz (%)"}
                                    </Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {mode === "add" &&
                                            <span className="text-sm text-amber-700 font-semibold">+$</span>}
                                        <Input
                                            type="number"
                                            value={mode === "add" ? addAmount : percent}
                                            onChange={(e) => mode === "add" ? setAddAmount(e.target.value) : setPercent(e.target.value)}
                                            min="0"
                                            step="0.5"
                                            className="w-24 h-8 text-sm"
                                        />
                                        {mode === "percent" &&
                                            <span className="text-sm text-amber-700 font-semibold">%</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground italic">
                            * Excel&apos;da SotuvNarxi ustuni bo&apos;sh bo&apos;lsa, yuqoridagi formula
                            qo&apos;llaniladi.
                        </p>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 border p-3 rounded-md">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">Shablon yuklab olish</span>
                            <span className="text-[10px] text-gray-500">To&apos;g&apos;ri format uchun</span>
                        </div>
                        <Button asChild size="sm" variant="secondary" className="h-8">
                            <a href={downloadTemplateURL} download>
                                <Download className="mr-2 h-4 w-4"/> Yuklash
                            </a>
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cost-price-excel-file" className="text-sm font-semibold">Excel fayl
                            (.xlsx)</Label>
                        <Input
                            id="cost-price-excel-file"
                            type="file"
                            accept=".xlsx"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="cursor-pointer"
                        />
                    </div>

                    {/* Duplicate warning */}
                    {duplicates.length > 0 && (
                        <div className="rounded-md border border-orange-200 bg-orange-50 p-3 space-y-2">
                            <p className="text-xs font-bold text-orange-700">
                                ⚠️ {duplicates.length} ta takrorlangan SKU topildi — oxirgi qator qiymati ishlatiladi
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-orange-600 border-b border-orange-200">
                                            <th className="text-left py-1 pr-3">SKU</th>
                                            <th className="text-right pr-3">TanNarx</th>
                                            <th className="text-right pr-3">SotuvNarxi</th>
                                            <th className="text-right">Omborda</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {duplicates.map((d) => (
                                            <tr key={d.sku} className="border-b border-orange-100 last:border-0">
                                                <td className="py-1 pr-3 font-mono font-semibold text-orange-800">
                                                    {d.sku}
                                                    <span className="ml-1 text-orange-400 font-normal">
                                                        ({d.rows.join(", ")}-qator)
                                                    </span>
                                                </td>
                                                <td className="text-right pr-3 text-slate-700">
                                                    {d.excelCostPrice != null ? `$${d.excelCostPrice}` : "—"}
                                                </td>
                                                <td className="text-right pr-3 text-slate-700">
                                                    {d.excelSellerPrice != null && d.excelSellerPrice > 0
                                                        ? `$${d.excelSellerPrice}`
                                                        : "—"}
                                                </td>
                                                <td className="text-right font-semibold text-slate-700">
                                                    {d.warehouseQuantity != null ? `${d.warehouseQuantity} ta` : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || isPending}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {isPending ? "Yangilanmoqda..." : "Yangilashni boshlash"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}