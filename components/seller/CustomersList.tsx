"use client";

import { useSellerCustomers } from "@/hooks/useSellerData";
import { Phone, TrendingDown, User, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Customer } from "@/interface/customer";

export default function CustomersList() {
  const { data: customers, isLoading } = useSellerCustomers();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-sm" />
        ))}
      </div>
    );
  }

  if (!customers?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-sm p-4 sm:p-10 text-center text-gray-400 text-xs font-bold uppercase">
        ✅ {`Qarzdor mijozlar yo'q`}
      </div>
    );
  }

  const totalDebt = customers.reduce(
    (sum: number, c: Customer) => sum + c.totalDebt,
    0,
  );

  return (
    <div className="space-y-4">
      {/* Jami qarz */}
      <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Jami qarzlar
          </p>
          <h2 className="text-3xl font-black text-red-500 mt-1">
            {totalDebt.toLocaleString()} $
          </h2>
        </div>
        <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
          <TrendingDown className="text-red-500 w-6 h-6" />
        </div>
      </div>

      {/* Qarzdorlar ro'yxati */}
      <div className="space-y-2">
        {customers.map((customer: Customer) => (
          <Card
            onClick={() => router.push(`/seller/${customer._id}`)}
            key={customer._id}
            className="border-gray-200 shadow-none rounded-sm hover:border-red-200 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Chap qism */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-gray-900 text-sm">
                      {customer.name}
                    </p>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Phone size={11} />
                      <span className="text-[11px] font-medium">
                        {customer.phone}
                      </span>
                    </div>
                    {customer.lastPurchase && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar size={11} />
                        <span className="text-[10px] font-medium">
                          {new Date(customer.lastPurchase).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* O'ng qism — qarz */}
                <div className="text-right">
                  <Badge className="bg-red-50 text-red-600 border-red-100 font-black text-sm px-3 py-1">
                    🔴 {customer.totalDebt.toLocaleString()} $
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
