"use client";

import { useState } from "react";
import { GroupedOrder } from "@/interface/sale.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  Calendar,
  Package,
  TrendingUp,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { HistorySkeleton } from "@/components/seller/SellerSkeleton";
import ReturnDialog from "@/components/admin/ReturnDialog";

interface Props {
  orders: GroupedOrder[];
  isLoading: boolean;
}

export default function SalesHistory({ orders, isLoading }: Props) {
  const [returnOrder, setReturnOrder] = useState<GroupedOrder | null>(null);
  const [activeTab, setActiveTab] = useState<"sold" | "returned">("sold");

  if (isLoading) return <HistorySkeleton />;

  // Order'da qaytarilgan itemlar bormi tekshirish
  const hasReturnedItems = (order: GroupedOrder) =>
    order.items.some((i) => i.status === "returned");

  // SOTILGAN: to'liq qaytarilganlardan tashqari hamma order
  const sold = orders.filter((o) => o.status !== "returned");
  // QAYTARILGAN: to'liq qaytarilgan + qisman qaytarilgan orderlar
  const returned = orders.filter(
    (o) => o.status === "returned" || hasReturnedItems(o),
  );
  const list = activeTab === "sold" ? sold : returned;

  const totalAmount = sold.reduce((s, o) => s + o.totalAmount, 0);
  const totalPaid = sold.reduce((s, o) => s + (o.paidAmount || 0), 0);
  const totalDebt = sold.reduce((s, o) => s + (o.debt || 0), 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Jami sotuv
            </p>
            <h2 className="text-2xl font-black text-primary mt-1">
              {totalAmount.toLocaleString()} $
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">
              {sold.length} ta order
            </p>
          </div>
          <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center">
            <TrendingUp className="text-primary w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Naqd tushum
            </p>
            <h2 className="text-2xl font-black text-green-600 mt-1">
              {totalPaid.toLocaleString()} $
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">{`Qo'ldagi pul`}</p>
          </div>
          <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
            <ShoppingBag className="text-green-500 w-6 h-6" />
          </div>
        </div>

        <div
          className={`bg-white border p-5 rounded-sm shadow-sm flex items-center justify-between ${totalDebt > 0 ? "border-red-200" : "border-gray-200"}`}
        >
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Qarzdorlar
            </p>
            <h2
              className={`text-2xl font-black mt-1 ${totalDebt > 0 ? "text-red-500" : "text-gray-400"}`}
            >
              {totalDebt.toLocaleString()} $
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">
              {sold.filter((o) => o.debt > 0).length} ta mijoz
            </p>
          </div>
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center ${totalDebt > 0 ? "bg-red-50" : "bg-gray-50"}`}
          >
            <AlertCircle
              className={`w-6 h-6 ${totalDebt > 0 ? "text-red-400" : "text-gray-300"}`}
            />
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "sold" | "returned")}
        className="w-fit"
      >
        <TabsList>
          <TabsTrigger
            value="sold"
            className="gap-2 sm:gap-4 text-[13px] sm:text-[16px] px-4 sm:px-10 font-bold"
          >
            SOTILGAN
            <Badge
              variant={activeTab === "sold" ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0 h-4"
            >
              {sold.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="returned"
            className="gap-2 sm:gap-4 text-[13px] sm:text-[16px] px-4 sm:px-10 font-bold"
          >
            QAYTARILGAN
            <Badge
              variant={activeTab === "returned" ? "default" : "secondary"}
              className={`text-[10px] px-1.5 py-0 h-4 `}
            >
              {returned.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders list */}
      {list.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-sm p-4 sm:p-10 text-center text-gray-400 text-xs font-bold uppercase">
          {activeTab === "sold"
            ? "Sotuvlar topilmadi"
            : "Qaytarilgan buyurtmalar yo'q"}
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {list.map((order) => (
            <AccordionItem
              key={order.orderId}
              value={order.orderId}
              className="bg-white border border-gray-200 rounded-sm px-4 hover:border-primary/40 transition-colors"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex justify-between items-start w-full mr-4">
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

                  <div className="text-right space-y-1">
                    <p className="font-black text-primary text-lg">
                      {activeTab === "returned" 
                        ? order.items
                            .filter(i => i.status === "returned")
                            .reduce((sum, i) => sum + i.totalAmount, 0)
                            .toLocaleString()
                        : order.totalAmount.toLocaleString()} $
                    </p>
                    {order.status === "returned" ? (
                      <span className="text-[10px] font-black text-orange-500 block">
                        {"↩ To'liq qaytarilgan"}
                      </span>
                    ) : hasReturnedItems(order) ? (
                      <span className="text-[10px] font-black text-orange-400 block">
                        ↩ Qisman qaytarilgan
                      </span>
                    ) : order.debt > 0 ? (
                      <span className="text-[10px] font-black text-red-500 block">
                        🔴 {order.debt.toLocaleString()} $ qarz
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-green-600 block">
                        ✅ {`To'liq to'langan`}
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
                  {(activeTab === "returned" && order.status !== "returned"
                    ? order.items.filter((i) => i.status === "returned")
                    : order.items
                  ).map((item) => {
                    const isItemReturned = item.status === "returned";
                    return (
                      <div
                        key={item._id}
                        className={`flex justify-between items-center py-2 border-b border-dashed border-gray-100 last:border-0 ${isItemReturned ? "opacity-60" : ""}`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-bold text-[11px] uppercase ${isItemReturned ? "text-orange-500 line-through" : "text-gray-900"}`}>
                              {item.product.sku || item.product.name}
                            </p>
                            {isItemReturned && (
                              <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 font-black text-orange-500 border-orange-300 bg-orange-50">
                                ↩ Qaytarilgan
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400">
                            {item.price.toLocaleString()} $ x {item.quantity} ta
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`font-black ${isItemReturned ? "text-orange-500 border-orange-300 line-through" : "text-primary border-primary/30"}`}
                        >
                          {item.totalAmount.toLocaleString()} $
                        </Badge>
                      </div>
                    );
                  })}

                  {activeTab === "returned" ? (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                        Qaytarilgan jami:
                      </span>
                      <span className="text-xl font-black text-orange-500">
                        {order.items
                          .filter((i) => i.status === "returned")
                          .reduce((sum, i) => sum + i.totalAmount, 0)
                          .toLocaleString()}{" "}
                        $
                      </span>
                    </div>
                  ) : (
                    <>
                      {order.discountPercent > 0 && (
                        <div className="space-y-1 py-1 border-b border-dashed border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase">
                              Chegirmasiz:
                            </span>
                            <span className="text-[11px] font-black text-gray-400 line-through">
                              {order.rawTotal.toLocaleString()} $
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase">
                              Chegirma:
                            </span>
                            <span className="text-[11px] font-black text-green-600">
                              -{order.discountPercent}% (-
                              {(
                                (Math.round(order.rawTotal * 100) -
                                  Math.round(order.totalAmount * 100)) /
                                100
                              ).toFixed(2)}{" "}
                              $)
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Jami:
                        </span>
                        <span className="text-xl font-black text-primary">
                          {order.totalAmount.toLocaleString()} $
                        </span>
                      </div>

                      {order.paidAmount > 0 && order.debt > 0 && (
                        <div className="flex justify-between items-center bg-green-50 px-3 py-2">
                          <span className="text-[10px] font-black text-green-600 uppercase">{`✅ To'langan:`}</span>
                          <span className="font-black text-green-600">
                            {order.paidAmount.toLocaleString()} $
                          </span>
                        </div>
                      )}

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
                    </>
                  )}

                  {order.notes && (
                    <p className="text-[11px] text-gray-400 italic border-t pt-2">
                      📝 {order.notes}
                    </p>
                  )}

                  {activeTab === "sold" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setReturnOrder(order)}
                    >
                      Tovarni qaytarish
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <ReturnDialog
        order={returnOrder}
        open={!!returnOrder}
        onOpenChange={(open) => {
          if (!open) setReturnOrder(null);
        }}
      />
    </div>
  );
}
