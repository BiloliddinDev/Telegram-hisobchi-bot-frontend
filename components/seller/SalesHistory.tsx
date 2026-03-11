"use client";

import { GroupedOrder } from "@/interface/sale.type";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Phone,
  Calendar,
  Package,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { HistorySkeleton } from "@/components/seller/SellerSkeleton";

interface Props {
  orders: GroupedOrder[];
  isLoading: boolean;
  totalAmount: number; // ← qo'shing
  totalCount: number;
}

export default function SalesHistory({
  orders,
  isLoading,
  totalAmount,
  totalCount,
}: Props) {
  if (isLoading) return <HistorySkeleton />;

  if (!orders?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-sm p-10 text-center text-gray-400 text-xs font-bold uppercase">
        Sotuvlar topilmadi
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Jami tushum
            </p>
            <h2 className="text-3xl font-black text-primary mt-1">
              {totalAmount.toLocaleString()} $
            </h2>
          </div>
          <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center">
            <TrendingUp className="text-primary w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Sotuvlar soni
            </p>
            <h2 className="text-3xl font-black text-gray-900 mt-1">
              {totalCount}{" "}
              <span className="text-sm font-bold text-gray-400">ta</span>
            </h2>
          </div>
          <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center">
            <ShoppingBag className="text-gray-400 w-6 h-6" />
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {orders.map((order) => (
          <AccordionItem
            key={order.orderId}
            value={order.orderId}
            className="bg-white border border-gray-200 rounded-sm px-4 hover:border-primary/40 transition-colors"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex justify-between items-start w-full mr-4">
                {/* Chap qism */}
                <div className="text-left space-y-1">
                  <p className="font-black text-gray-900">
                    {order.customerName || "Noma'lum mijoz"}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Phone size={10} />
                      <span className="text-[11px]">
                        {order.customerPhone || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Package size={10} />
                      <span className="text-[11px] font-bold">
                        {order.items.length} xil mahsulot
                      </span>
                    </div>
                  </div>
                </div>

                {/* O'ng qism */}
                <div className="text-right space-y-1">
                  <p className="font-black text-primary text-lg">
                    {order.totalAmount.toLocaleString()} $
                  </p>
                  {order.debt > 0 ? (
                    <span className="text-[10px] font-black text-red-500 block">
                      🔴 {order.debt.toLocaleString()} $ qarz
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-green-600 block">
                      ✅ To'liq to'langan
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-gray-400 justify-end">
                    <Calendar size={10} />
                    <span className="text-[10px]">
                      {new Date(order.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4">
              <div className="space-y-2 pt-2 border-t border-dashed border-gray-100">
                {/* Itemlar */}
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center py-2 border-b border-dashed border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-bold text-[11px] text-gray-900 uppercase">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {item.price.toLocaleString()} $ x {item.quantity} ta
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="font-black text-primary border-primary/30"
                    >
                      {item.totalAmount.toLocaleString()} $
                    </Badge>
                  </div>
                ))}

                {order.discountPercent > 0 && (
                  <div className="space-y-1 py-1 border-b border-dashed border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase">
                        Chegirmasiz:
                      </span>
                      <span className="text-[11px] font-black text-gray-400 line-through">
                        {order.rawTotal.toLocaleString()} $ {/* ← rawTotal */}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase">
                        Chegirma:
                      </span>
                      <span className="text-[11px] font-black text-green-600">
                        -{order.discountPercent}% (-
                        {(order.rawTotal - order.totalAmount).toFixed(2)} $)
                      </span>
                    </div>
                  </div>
                )}
                {/* Jami + Qarz */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Jami:
                  </span>
                  <span className="text-xl font-black text-primary">
                    {order.totalAmount.toLocaleString()} $
                  </span>
                </div>

                {order.debt > 0 && (
                  <div className="flex justify-between items-center bg-red-50 px-3 py-2">
                    <span className="text-[10px] font-black text-red-500 uppercase">
                      🔴 Qarz:
                    </span>
                    <span className="font-black text-red-500">
                      {order.debt.toLocaleString()} $
                    </span>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <p className="text-[11px] text-gray-400 italic border-t pt-2">
                    📝 {order.notes}
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
