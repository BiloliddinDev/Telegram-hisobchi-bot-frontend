"use client";

import { Product, ProductUpdateInput } from "@/interface/products.type";
import { EditProductDialog } from "./EditProductDialog";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Loader2 } from "lucide-react";
import { useDeleteProduct, usePatchProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/useToast";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface ProductTableProps {
  products: Product[];
}

interface EditingCell {
  id: string;
  field: keyof ProductUpdateInput;
}

export function ProductTable({ products }: ProductTableProps) {
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: patchProduct } = usePatchProduct();
  const { showToast } = useToast();
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleDelete = (id: string) => {
    if (confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) {
      deleteProduct(id, {
        onSuccess: () => {
          showToast("Mahsulot o'chirildi", "success");
        },
        onError: () => {
          showToast("Xatolik yuz berdi", "error");
        },
      });
    }
  };

  const startEditing = (id: string, field: keyof ProductUpdateInput, initialValue: string | number | null | undefined) => {
    setEditingCell({ id, field });
    setEditValue(String(initialValue ?? ""));
  };

  const handleUpdate = () => {
    if (!editingCell) return;

    const { id, field } = editingCell;
    const product = products.find(p => p._id === id);
    if (!product) return;

    let newValue: string | number = editValue;
    
    // Type conversion based on field
    if (field === "price" || field === "costPrice" || field === "warehouseQuantity") {
      newValue = Number(editValue);
      if (isNaN(newValue)) {
        showToast("Iltimos, raqam kiriting", "error");
        setEditingCell(null);
        return;
      }
    }

    // Check if value actually changed
    const currentValue = product[field as keyof Product] as string | number | undefined;
    if (currentValue === newValue) {
        setEditingCell(null);
        return;
    }

    setIsUpdating(`${id}-${field}`);
    patchProduct(
      { id, data: { [field]: newValue } },
      {
        onSuccess: () => {
          showToast(`${field} yangilandi`, "success");
          setIsUpdating(null);
        },
        onError: (err: unknown) => {
          let errMsg = "Xatolik yuz berdi";
          if (axios.isAxiosError<{ error: string }>(err)) {
            errMsg = err.response?.data?.error || err.message;
          } else if (err instanceof Error) {
            errMsg = err.message;
          }
          showToast(errMsg, "error");
          setIsUpdating(null);
        },
      }
    );
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUpdate();
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const renderCell = (product: Product, field: keyof ProductUpdateInput, displayValue: React.ReactNode, isNumeric = false) => {
    const isEditing = editingCell?.id === product._id && editingCell?.field === field;
    const isThisCellUpdating = isUpdating === `${product._id}-${field}`;

    if (isEditing) {
      return (
        <td className={`p-1 align-middle ${isNumeric ? "text-right" : ""}`}>
          <Input
            ref={inputRef}
            type={isNumeric ? "number" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleUpdate}
            onKeyDown={handleKeyDown}
            className={`h-8 px-2 text-xs font-medium border-primary focus-visible:ring-1 ${isNumeric ? "text-right" : ""}`}
          />
        </td>
      );
    }

    return (
      <td 
        className={`p-4 align-middle group cursor-pointer relative ${isNumeric ? "text-right" : ""}`}
        onDoubleClick={() => startEditing(product._id, field, product[field as keyof Product] as string | number | undefined)}
      >
        <div className="flex items-center justify-between gap-1">
          {displayValue}
          {isThisCellUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          ) : (
            <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-30 transition-opacity text-primary" />
          )}
        </div>
      </td>
    );
  };

  return (
    <div className="space-y-4 mt-4 p-2">
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 transition-colors">
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-12">
                No
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                SKU
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                Nomi
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                Kategoriya
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                Rangi
              </th>
              <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                Tan narxi
              </th>
              <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                Sotuv narxi
              </th>
              <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                Ombor
              </th>
              <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">
                Amallar
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {products.map((product, index) => (
              <tr
                key={product._id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4 align-middle font-mono text-xs">
                  {index + 1}
                </td>
                {renderCell(product, "sku", <span className="font-mono text-xs">{product.sku || "-"}</span>)}
                {renderCell(product, "name", <div className="font-medium">{product.name}</div>)}
                <td className="p-4 align-middle">{product.category.name}</td>
                {renderCell(product, "color", <div>{product.color || "-"}</div>)}
                {renderCell(product, "costPrice", <span>{"$" + (product.costPrice || 0).toLocaleString()}</span>, true)}
                {renderCell(product, "price", <span className="font-semibold text-green-600">{"$" + (product.price || 0).toLocaleString()}</span>, true)}
                {renderCell(product, "warehouseQuantity", (
                  <span className={product.warehouseQuantity < 10 ? "text-red-500 font-bold" : ""}>
                    {product.warehouseQuantity}
                  </span>
                ), true)}
                <td className="p-4 align-middle text-center">
                  <div className="flex justify-center gap-1">
                    <EditProductDialog product={product} />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 border-none"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[10px] text-muted-foreground italic text-center">
        * Tahrirlash uchun katak ustiga ikki marta bosing
      </div>
    </div>
  );
}
