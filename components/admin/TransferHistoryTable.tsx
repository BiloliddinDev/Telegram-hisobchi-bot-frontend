"use client";

import { useTransfers, useUpdateTransfer, useReturnTransfer } from "@/hooks/useTransfers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, RotateCcw, Check, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { AxiosError } from "axios";

export function TransferHistoryTable() {
  const { data, isLoading } = useTransfers();
  const { mutate: updateTransfer } = useUpdateTransfer();
  const { mutate: returnTransfer } = useReturnTransfer();
  const { showToast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  if (isLoading) return <div>Yuklanmoqda...</div>;

  const transfers = data?.transfers || [];

  const handleEdit = (id: string, currentQty: number) => {
    setEditingId(id);
    setEditQty(currentQty);
  };

  const saveEdit = (id: string) => {
    updateTransfer({ id, quantity: editQty }, {
      onSuccess: () => {
        showToast("Transfer yangilandi", "success");
        setEditingId(null);
      },
      onError: (err: unknown) => {
        const axiosError = err as AxiosError<{ error: string }>;
        showToast(axiosError.response?.data?.error || "Xatolik", "error");
      }
    });
  };

  const handleReturn = (id: string) => {
    if (confirm("Ushbu mahsulotlarni omborga qaytarmoqchimisiz?")) {
      returnTransfer(id, {
        onSuccess: () => {
          showToast("Mahsulot qaytarildi", "success");
        },
        onError: (err: unknown) => {
          const axiosError = err as AxiosError<{ error: string }>;
          showToast(axiosError.response?.data?.error || "Xatolik", "error");
        }
      });
    }
  };

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sana</TableHead>
            <TableHead>Kimga</TableHead>
            <TableHead>Mahsulot</TableHead>
            <TableHead>Miqdor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Hali transferlar yo&apos;q
              </TableCell>
            </TableRow>
          ) : (
            transfers.map((transfer) => (
              <TableRow key={transfer._id}>
                <TableCell className="text-xs">
                  {new Date(transfer.createdAt).toLocaleDateString("uz-UZ")}
                </TableCell>
                <TableCell className="font-medium">
                  {transfer.seller?.firstName} {transfer.seller?.lastName}
                </TableCell>
                <TableCell>{transfer.product?.name}</TableCell>
                <TableCell>
                  {editingId === transfer._id ? (
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="number" 
                        value={editQty} 
                        onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                        className="w-20 h-8"
                      />
                    </div>
                  ) : (
                    <span className="font-bold">{transfer.quantity} ta</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={
                      transfer.type === "return" 
                        ? "bg-orange-500 hover:bg-orange-600" 
                        : transfer.status === "cancelled" 
                          ? "bg-destructive/20 text-destructive border-destructive/20"
                          : "bg-green-600 hover:bg-green-700"
                    }
                  >
                    {transfer.type === "transfer" ? (transfer.status === "cancelled" ? "Bekor qilingan" : "Biriktirilgan") : "Qaytarilgan"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {editingId === transfer._id ? (
                      <>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => saveEdit(transfer._id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : transfer.status !== "cancelled" && transfer.type !== "return" ? (
                      <>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8" 
                          onClick={() => handleEdit(transfer._id, transfer.quantity)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-orange-500"
                          onClick={() => handleReturn(transfer._id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
