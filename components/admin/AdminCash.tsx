"use client";

import React, {useState} from "react";
import {
    useCashBalance,
    useCashTransactions,
    useCashWithdraw,
    useDeleteCashTransaction,
} from "@/hooks/useAdminData";
import {useToast} from "@/hooks/useToast";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Trash2,
    Calendar as CalendarIcon,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
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

    const start = formatDateAPI(startDate);
    const end = formatDateAPI(endDate);

    const {data: balance, isLoading: balanceLoading} = useCashBalance(
        start,
        end,
    );
    const {data: transactionsData, isLoading: txLoading} =
        useCashTransactions(start, end, filterType, page);
    const {mutate: withdraw, isPending: isWithdrawing} = useCashWithdraw();
    const {mutate: deleteTransaction} = useDeleteCashTransaction();

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
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="flex gap-2">
                            <Button
                                variant={filterType === "" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setFilterType("");
                                    setPage(1);
                                }}
                            >
                                Hammasi
                            </Button>
                            <Button
                                variant={filterType === "in" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setFilterType("in");
                                    setPage(1);
                                }}
                            >
                                Kirim
                            </Button>
                            <Button
                                variant={filterType === "out" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setFilterType("out");
                                    setPage(1);
                                }}
                            >
                                Chiqim
                            </Button>
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
                                            <ArrowUpCircle className="h-5 w-5 text-destructive"/>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">
                                                {tx.description ||
                                                    (tx.type === "in" ? "Kirim" : "Chiqim")}
                                            </p>
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
                                            variant={
                                                tx.type === "in" ? "secondary" : "destructive"
                                            }
                                        >
                                            {tx.type === "in" ? "+" : "-"}
                                            {tx.amount.toLocaleString()} $
                                        </Badge>
                                        {tx.type === "out" && (
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
