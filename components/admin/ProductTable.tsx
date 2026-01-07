"use client";

import { Product } from "@/interface/products.type";
import { EditProductDialog } from "./EditProductDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDeleteProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/useToast";

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const { mutate: deleteProduct } = useDeleteProduct();
  const { showToast } = useToast();

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

  return (
    <div className="space-y-4 mt-4 p-2">
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 transition-colors">
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
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
                <td className="p-4 align-middle font-mono text-xs">
                  {product.sku || "-"}
                </td>
                <td className="p-4 align-middle">
                  <div className="font-medium">{product.name}</div>
                  {product.color && (
                    <div className="text-xs text-muted-foreground">
                      Rang: {product.color}
                    </div>
                  )}
                </td>
                <td className="p-4 align-middle">{product.category.name}</td>
                <td className="p-4 align-middle text-right">
                  {"$" + (product.costPrice || 0).toLocaleString()}
                </td>
                <td className="p-4 align-middle text-right font-semibold text-green-600">
                  {"$" + (product.price || 0).toLocaleString()}
                </td>
                <td className="p-4 align-middle text-right">
                  <span
                    className={
                      product.warehouseQuantity < 10
                        ? "text-red-500 font-bold"
                        : ""
                    }
                  >
                    {product.warehouseQuantity}
                  </span>
                </td>
                <td className="p-4 align-middle text-center">
                  <div className="flex justify-center gap-2">
                    <EditProductDialog product={product} />
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
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
    </div>
  );
}
