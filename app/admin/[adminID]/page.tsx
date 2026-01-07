"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Package,
  ArrowLeftRight,
  Phone,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function AdminSellerDetailPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const seller = {
    firstName: "Ali",
    lastName: "Valiyev",
    username: "ali_sotuvchi",
    phone: "+998 90 123 45 67",
    region: "Toshkent sh.",
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 shadow-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">
              {seller.firstName} {seller.lastName}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Sotuvchi profili va mahsulotlar nazorati
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="bg-white px-3 py-1 border-slate-200"
          >
            <Phone size={12} className="mr-2 text-primary" /> {seller.phone}
          </Badge>
          <Badge
            variant="outline"
            className="bg-white px-3 py-1 border-slate-200"
          >
            <MapPin size={12} className="mr-2 text-primary" /> {seller.region}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <div className="bg-white p-2 border rounded-sm shadow-sm mb-6">
          <TabsList className="grid w-full grid-cols-2 sm:w-[400px] h-10 bg-slate-100 p-1">
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-white font-bold text-[11px] uppercase tracking-wider gap-2"
            >
              <Package size={14} className="text-primary" /> Inventar
            </TabsTrigger>
            <TabsTrigger
              value="returns"
              className="data-[state=active]:bg-white font-bold text-[11px] uppercase tracking-wider gap-2"
            >
              <ArrowLeftRight size={14} className="text-primary" /> Zaxirani
              qaytarish
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1-TAB: SOTUVCHI MAHSULOTLARI */}
        <TabsContent value="inventory" className="mt-0 outline-none">
          <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-800">{`Sotuvchi qo'lidagi mahsulotlar`}</CardTitle>
                  <CardDescription className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                    {`Hozirda sotuvchida mavjud bo'lgan jami tovarlar ro'yxati`}
                  </CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Mahsulotlarni qidirish..."
                    className="pl-10 h-10 rounded-sm border-slate-200 bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase text-slate-500 py-4 px-6">
                        Mahsulot
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-500 py-4 px-6">
                        SKU / Kod
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-500 py-4 px-6">
                        Kategoriya
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-500 py-4 px-6 text-center">
                        Mavjud
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-500 py-4 px-6 text-right">
                        Narxi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Ma'lumotlar bu yerda map qilinadi */}
                    <TableRow className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                      <TableCell className="px-6 py-4">
                        <p className="text-xs font-black uppercase text-slate-800">
                          Iphone 15 Pro Max
                        </p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <code className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-sm text-slate-600">
                          IPH-15-PM
                        </code>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className="text-[9px] font-black uppercase tracking-tighter"
                        >
                          Smartfonlar
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <span className="text-xs font-black text-primary">
                          12 ta
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <p className="text-xs font-black text-slate-900">
                          1,200 $
                        </p>
                      </TableCell>
                    </TableRow>

                    {/* Agar mahsulot bo'lmasa */}
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-slate-400 font-bold uppercase text-[10px]"
                      >
                        Mahsulotlar topilmadi
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="mt-0 outline-none">
          <Card className="rounded-sm border-slate-200 shadow-none border-dashed bg-slate-50/50">
            <CardContent className="h-64 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-white rounded-full border border-slate-200 text-slate-400">
                <ArrowLeftRight size={32} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-slate-800 tracking-widest">
                  Zaxirani qaytarib olish
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 max-w-[300px]">
                  {`Bu bo'lim orqali sotuvchi qo'lidagi ortiqcha mahsulotlarni asosiy omborga qaytarib olishingiz mumkin.`}
                </p>
              </div>
              <Button
                variant="outline"
                disabled
                className="text-[10px] font-black uppercase"
              >
                Tezkunda amalga oshiriladi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
