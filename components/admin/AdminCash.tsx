"use client";

import React, {useState} from "react";
import {
    useCashBalance,
    useCashTransactions,
    useCashWithdraw,
    useCashSpend,
    useDeleteCashTransaction,
    useSellers,
} from "@/hooks/useAdminData";
import {useToast} from "@/hooks/useToast";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Trash2,
    Calendar as CalendarIcon,
    AlertTriangle,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Separator} from "@/components/ui/separator";
import {TabsContent} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {CashTransaction} from "@/interface/analytic.type";
import {format} from "date-fns";
import {uz} from "date-fns/locale";

const formatDateAPI = (date: Date): string => date.toISOString().split("T")[0];

export default function AdminCash() {
    const {showToast} = useToast();
    const [startDate, setStartDate] = useState<Date>(
        new Date(new Date().setMonth(new Date().getMonth() - 1)),
    );
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [filterType, setFilterType] = useState<string>("");
    const [page, setPage] = useState(1);

    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawDescription, setWithdrawDescription] = useState("");

    const [spendAmount, setSpendAmount] = useState("");
    const [spendType, setSpendType] = useState<"rashot" | "oylik">("rashot");
    const [spendDescription, setSpendDescription] = useState("");
    const [spendSellerId, setSpendSellerId] = useState("");

    const start = formatDateAPI(startDate);
    const end = formatDateAPI(endDate);

    const {data: balance, isLoading: balanceLoading} = useCashBalance(
        start,
        end,
    );
    const {data: transactionsData, isLoading: txLoading} =
        useCashTransactions(start, end, filterType, page);
    const {mutate: withdraw, isPending: isWithdrawing} = useCashWithdraw();
    const {mutate: spend, isPending: isSpending} = useCashSpend();
    const {mutate: deleteTransaction} = useDeleteCashTransaction();
    const {data: sellers} = useSellers();

    const handleWithdraw = () => {
        const amount = Number(withdrawAmount);
        if (!amount || amount <= 0) {
            showToast("Summa 0 dan katta bo'lishi kerak", "error");
            return;
        }
        if (!withdrawDescription.trim()) {
            showToast("Izoh yozish majburiy", "error");
            return;
        }

        withdraw(
            {amount, description: withdrawDescription.trim()},
            {
                onSuccess: () => {
                    showToast("Kassadan pul muvaffaqiyatli olindi", "success");
                    setWithdrawAmount("");
                    setWithdrawDescription("");
                },
                onError: (error: Error) => {
                    showToast(error.message || "Xatolik yuz berdi", "error");
                },
            },
        );
    };

    const handleSpend = () => {
        const amount = Number(spendAmount);
        if (!amount || amount <= 0) {
            showToast("Summa 0 dan katta bo'lishi kerak", "error");
            return;
        }
        if (spendType === "oylik" && !spendSellerId) {
            showToast("Oylik uchun sotuvchini tanlash majburiy", "error");
            return;
        }

        spend(
            {
                amount,
                type: spendType,
                description: spendDescription.trim() || undefined,
                sellerId: spendType === "oylik" ? spendSellerId : undefined,
            },
            {
                onSuccess: () => {
                    showToast(
                        spendType === "oylik" ? "Oylik muvaffaqiyatli berildi" : "Rashot qayd etildi",
                        "success",
                    );
                    setSpendAmount("");
                    setSpendDescription("");
                    setSpendSellerId("");
                },
                onError: (error: Error) => {
                    showToast(error.message || "Xatolik yuz berdi", "error");
                },
            },
        );
    };

    const handleDelete = (id: string) => {
        deleteTransaction(id, {
            onSuccess: () => showToast("Tranzaksiya o'chirildi", "success"),
            onError: (error: Error) =>
                showToast(error.message || "Xatolik", "error"),
        });
    };

    if (balanceLoading) {
        return (
            <TabsContent value="cash" className="mt-4 space-y-4">
                <div className="space-y-4 animate-pulse">
                    <div className="h-32 bg-muted rounded-lg"/>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-48 bg-muted rounded-lg"/>
                        <div className="h-48 bg-muted rounded-lg"/>
                    </div>
                    <div className="h-64 bg-muted rounded-lg"/>
                </div>
            </TabsContent>
        );
    }

    return (
        <TabsContent value="cash" className="mt-4 space-y-4">
            {/* Kassa Balansi */}
            <Card>
                <CardHeader>
                    <CardTitle>Kassa</CardTitle>
                    <CardDescription>
                        {format(startDate, "dd.MM.yyyy")} — {format(endDate, "dd.MM.yyyy")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Balans</p>
                            <p className="text-4xl font-bold tracking-tight">
                                {(balance?.balance || 0).toLocaleString()} $
                            </p>
                        </div>
                        <Separator orientation="vertical" className="hidden md:block h-12"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Kirim</p>
                            <p className="text-xl font-semibold">
                                +{(balance?.totalIn || 0).toLocaleString()} $
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {balance?.countIn || 0} ta operatsiya
                            </p>
                        </div>
                        <Separator orientation="vertical" className="hidden md:block h-12"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Chiqim</p>
                            <p className="text-xl font-semibold">
                                -{(balance?.totalOut || 0).toLocaleString()} $
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {balance?.countOut || 0} ta operatsiya
                            </p>
                        </div>
                        <Separator orientation="vertical" className="hidden md:block h-12"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Admin Hamyon</p>
                            <p className={`text-xl font-semibold ${(balance?.adminPocket || 0) >= 0 ? "text-amber-500" : "text-destructive"}`}>
                                {(balance?.adminPocket || 0).toLocaleString()} $
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Qo&apos;ldagi pul
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {balance && balance.adminPocket < 0 && (
                <Alert variant="destructive" className="border-destructive/50">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertDescription>
                        Admin hamyoni manfiy: <strong>{balance.adminPocket.toLocaleString()} $</strong>.
                        Rashot yoki oylik chiqimlari kassadan olingan puldan oshib ketdi.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pul olish */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kassadan pul olish</CardTitle>
                        <CardDescription>
                            Admin kassadan pul olganini qayd etish
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Summa ($)</Label>
                            <Input
                                type="number"
                                placeholder="Masalan: 200"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Izoh</Label>
                            <Input
                                placeholder="Masalan: Admin pul oldi"
                                value={withdrawDescription}
                                onChange={(e) => setWithdrawDescription(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleWithdraw}
                            disabled={isWithdrawing}
                            className="w-full"
                        >
                            {isWithdrawing ? (
                                <div
                                    className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full"/>
                            ) : (
                                "Pul olish"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Chiqim (Rashot / Oylik) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Chiqim</CardTitle>
                        <CardDescription>
                            Admin hamyonidan rashot yoki oylik
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button
                                variant={spendType === "rashot" ? "default" : "outline"}
                                size="sm"
                                className="flex-1"
                                onClick={() => setSpendType("rashot")}
                            >
                                Chiqim
                            </Button>
                            <Button
                                variant={spendType === "oylik" ? "default" : "outline"}
                                size="sm"
                                className="flex-1"
                                onClick={() => setSpendType("oylik")}
                            >
                                Oylik
                            </Button>
                        </div>
                        {spendType === "oylik" && (
                            <div className="space-y-2">
                                <Label>Sotuvchi</Label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={spendSellerId}
                                    onChange={(e) => setSpendSellerId(e.target.value)}
                                >
                                    <option value="">Sotuvchini tanlang</option>
                                    {sellers?.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.firstName} {s.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Summa ($)</Label>
                            <Input
                                type="number"
                                placeholder="Masalan: 50"
                                value={spendAmount}
                                onChange={(e) => setSpendAmount(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Izoh (ixtiyoriy)</Label>
                            <Input
                                placeholder="Masalan: Aprel oylik"
                                value={spendDescription}
                                onChange={(e) => setSpendDescription(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleSpend}
                            disabled={isSpending}
                            className="w-full"
                            variant="secondary"
                        >
                            {isSpending ? (
                                <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full"/>
                            ) : (
                                spendType === "oylik" ? "Oylik berish" : "Chiqim qayd etish"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Filter */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                        <CardDescription>{`Sana va tur bo'yicha filterlash`}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <CalendarIcon className="mr-2 h-4 w-4"/>
                                        Dan: {format(startDate, "dd MMM", {locale: uz})}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(d) => d && setStartDate(d)}
                                        disabled={(d) => d > new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                            <span className="text-muted-foreground">—</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <CalendarIcon className="mr-2 h-4 w-4"/>
                                        Gacha: {format(endDate, "dd MMM", {locale: uz})}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={(d) => d && setEndDate(d)}
                                        disabled={(d) => d < startDate || d > new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Separator/>
                        <div className="flex flex-wrap gap-2">
                            {[
                                {label: "Hammasi", value: ""},
                                {label: "Kirim", value: "in"},
                                {label: "Chiqim", value: "out"},
                                {label: "Rashot", value: "rashot"},
                                {label: "Oylik", value: "oylik"},
                            ].map(({label, value}) => (
                                <Button
                                    key={value}
                                    variant={filterType === value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setFilterType(value);
                                        setPage(1);
                                    }}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tranzaksiyalar */}
            <Card>
                <CardHeader>
                    <CardTitle>Tranzaksiyalar tarixi</CardTitle>
                    <CardDescription>
                        Jami: {transactionsData?.pagination?.total || 0} ta yozuv
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {txLoading ? (
                        <p className="text-center text-muted-foreground py-8">
                            Yuklanmoqda...
                        </p>
                    ) : !transactionsData?.transactions?.length ? (
                        <p className="text-center text-muted-foreground py-8">
                            Tranzaksiyalar topilmadi
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {transactionsData.transactions.map((tx: CashTransaction) => (
                                <div
                                    key={tx._id}
                                    className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        {tx.type === "in" ? (
                                            <ArrowDownCircle className="h-5 w-5 text-green-600"/>
                                        ) : (
                                            <ArrowUpCircle className={`h-5 w-5 ${tx.type === "out" ? "text-destructive" : "text-amber-500"}`}/>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium">
                                                    {tx.description || (
                                                        tx.type === "in" ? "Kirim" :
                                                        tx.type === "out" ? "Chiqim" :
                                                        tx.type === "rashot" ? "Rashot" : "Oylik"
                                                    )}
                                                </p>
                                                {tx.type === "rashot" && (
                                                    <Badge variant="outline" className="text-yellow-600 border-yellow-400 text-[10px] px-1 py-0">Rashot</Badge>
                                                )}
                                                {tx.type === "oylik" && (
                                                    <Badge variant="outline" className="text-blue-600 border-blue-400 text-[10px] px-1 py-0">
                                                        Oylik{tx.relatedSeller ? ` · ${tx.relatedSeller.firstName} ${tx.relatedSeller.lastName}` : ""}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {tx.performedBy?.firstName} {tx.performedBy?.lastName}{" "}
                                                &middot;{" "}
                                                {format(new Date(tx.createdAt), "dd.MM.yyyy HH:mm", {
                                                    locale: uz,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={tx.type === "in" ? "secondary" : "destructive"}
                                            className={tx.type === "rashot" || tx.type === "oylik" ? "bg-amber-100 text-amber-800 border-amber-300" : ""}
                                        >
                                            {tx.type === "in" ? "+" : "-"}
                                            {tx.amount.toLocaleString()} $
                                        </Badge>
                                        {(tx.type === "out" || tx.type === "rashot" || tx.type === "oylik") && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleDelete(tx._id)}
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {transactionsData && transactionsData.pagination.pages > 1 && (
                        <>
                            <Separator className="my-4"/>
                            <div className="flex justify-center items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Oldingi
                                </Button>
                                <span className="text-sm text-muted-foreground">
                  {page} / {transactionsData.pagination.pages}
                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= transactionsData.pagination.pages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Keyingi
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    );
}
