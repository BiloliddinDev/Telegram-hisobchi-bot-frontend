"use client";

import { useTransfers } from "@/hooks/useTransfers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function TransferHistoryTable() {
  const { data, isLoading } = useTransfers();
  // const { mutate: updateTransfer } = useUpdateTransfer();
  // const { mutate: returnTransfer } = useReturnTransfer();

  if (isLoading) return <div>Yuklanmoqda...</div>;

  const transfers = data?.transfers || [];

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
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
                  {transfer.sellerId?.firstName} {transfer.sellerId?.lastName}
                </TableCell>
                <TableCell>{transfer.productId?.name}</TableCell>
                <TableCell>
                  <span className="font-bold">{transfer.quantity} ta</span>
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
                    {transfer.type === "transfer"
                      ? transfer.status === "cancelled"
                        ? "Bekor qilingan"
                        : "Biriktirilgan"
                      : "Qaytarilgan"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
