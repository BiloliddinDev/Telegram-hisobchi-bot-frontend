"use client";

import { useParams, useRouter } from "next/navigation";
import { useCustomerDetail, useAcceptPayment } from "@/hooks/useCustomer";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Phone, Calendar, Package, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [isPaymentModal, setIsPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const { data, isLoading } = useCustomerDetail(id);
  const { mutateAsync: acceptPayment, isPending } = useAcceptPayment();

  const handlePayment = async () => {
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      showToast("To'lov summasi noto'g'ri", "error");
      return;
    }
    try {
      await acceptPayment({ id, amount, notes: paymentNotes });
      showToast("To'lov qabul qilindi!", "success");
      setIsPaymentModal(false);
      setPaymentAmount("");
      setPaymentNotes("");
    } catch (error: any) {
      showToast(error.response?.data?.error || "Xatolik yuz berdi", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-20 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { customer, orders, payments } = data || {};

  return (
    <div className="min-h-screen bg-background mt-16">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-base font-semibold text-foreground">
                {customer?.name}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone size={11} />
                {customer?.phone}
              </p>
            </div>
          </div>

          {/* Qarz badge */}
          <div className="text-right">
            {customer?.totalDebt > 0 ? (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                {customer.totalDebt.toLocaleString()} $ qarz
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 text-green-600 border-green-200"
              >
                ✅ Qarz yo'q
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* To'lov tugmasi */}
        {customer?.totalDebt > 0 && (
          <Button
            onClick={() => setIsPaymentModal(true)}
            className="w-full"
            size="lg"
          >
            <CreditCard size={16} className="mr-2" />
            To'lov qabul qilish
          </Button>
        )}

        {/* Tabs */}
        <Tabs defaultValue="orders">
          <TabsList className="w-full">
            <TabsTrigger value="orders" className="flex-1">
              Xaridlar tarixi
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex-1">
              To'lovlar tarixi
            </TabsTrigger>
          </TabsList>

          {/* Xaridlar */}
          <TabsContent value="orders" className="mt-4 space-y-2">
            {!orders?.length ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Xaridlar topilmadi
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {orders.map((order: any) => (
                  <AccordionItem
                    key={order.orderId}
                    value={order.orderId}
                    className="border rounded-lg px-4 bg-white"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex justify-between items-start w-full mr-4">
                        <div className="text-left space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar size={12} />
                            <span className="text-xs">
                              {new Date(order.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Package size={12} />
                            <span className="text-xs">
                              {order.items.length} xil mahsulot
                            </span>
                          </div>
                          {order.dueDate && (
                            <div
                              className={cn(
                                "text-xs font-medium",
                                new Date(order.dueDate) < new Date()
                                  ? "text-destructive"
                                  : "text-muted-foreground",
                              )}
                            >
                              📅 Muddat:{" "}
                              {new Date(order.dueDate).toLocaleDateString()}
                              {new Date(order.dueDate) < new Date() && " ⚠️"}
                            </div>
                          )}
                        </div>

                        <div className="text-right space-y-1">
                          <p className="font-semibold text-foreground">
                            {order.totalAmount.toLocaleString()} $
                          </p>
                          {order.debt > 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              {order.debt.toLocaleString()} $ qarz
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs text-green-600 border-green-200"
                            >
                              To'liq to'langan
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-4">
                      <div className="space-y-2 pt-2 border-t">
                        {order.items.map((item: any) => (
                          <div
                            key={item._id}
                            className="flex justify-between items-center py-2 border-b last:border-0"
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {item.product?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.price?.toLocaleString()} $ ×{" "}
                                {item.quantity} ta
                              </p>
                            </div>
                            <span className="text-sm font-semibold">
                              {item.totalAmount?.toLocaleString()} $
                            </span>
                          </div>
                        ))}

                        {/* Jami */}
                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Jami:</span>
                            <span className="font-semibold">
                              {order.totalAmount?.toLocaleString()} $
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              To'langan:
                            </span>
                            <span className="font-semibold text-green-600">
                              {order.paidAmount?.toLocaleString()} $
                            </span>
                          </div>
                          {order.debt > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Qarz:
                              </span>
                              <span className="font-semibold text-destructive">
                                {order.debt?.toLocaleString()} $
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          {/* To'lovlar */}
          <TabsContent value="payments" className="mt-4 space-y-2">
            {!payments?.length ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                To'lovlar topilmadi
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((payment: any) => (
                  <div
                    key={payment._id}
                    className="bg-white border rounded-lg px-4 py-3 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={12} />
                        <span className="text-xs">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {payment.notes && (
                        <p className="text-xs text-muted-foreground">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-green-600">
                      +{payment.amount?.toLocaleString()} $
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* To'lov Modal */}
      <Dialog open={isPaymentModal} onOpenChange={setIsPaymentModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>To'lov qabul qilish</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm text-muted-foreground">Jami qarz:</span>
              <span className="font-semibold text-destructive">
                {customer?.totalDebt?.toLocaleString()} $
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To'lov summasi</label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={paymentAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  setPaymentAmount(val);
                }}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Izoh{" "}
                <span className="text-muted-foreground font-normal">
                  (ixtiyoriy)
                </span>
              </label>
              <Input
                placeholder="Masalan: Naqd to'lov"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="h-11"
              />
            </div>

            <Button
              onClick={handlePayment}
              disabled={isPending || !paymentAmount}
              className="w-full"
              size="lg"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Yuborilmoqda...
                </span>
              ) : (
                "To'lovni tasdiqlash"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
