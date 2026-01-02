/* eslint-disable react/no-unescaped-entities */
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Seller } from "@/interface/seller.type";
import { Button } from "@/components/ui/button";
import { Trash2, Phone, User as UserIcon } from "lucide-react";
import { useDeleteSeller } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/useToast";
import { EditSellerDialog } from "@/components/admin/EditSellerDialog";

export function SellerCard({ seller }: { seller: Seller }) {
  const { mutate: deleteSeller, isPending: isDeleting } = useDeleteSeller();
  const { showToast } = useToast();

  const handleDelete = () => {
    if (confirm("Haqiqatan ham ushbu sotuvchini o'chirmoqchimisiz?")) {
      deleteSeller(seller._id, {
        onSuccess: () => {
          showToast("Sotuvchi o'chirildi", "success");
        },
        onError: () => {
          showToast("O'chirishda xatolik yuz berdi", "error");
        },
      });
    }
  };

  const initials = `${seller.firstName?.[0] || ""}${seller.lastName?.[0] || ""}`.toUpperCase();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <div className="relative h-16 w-16 flex-shrink-0">
            {seller.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={seller.avatarUrl}
                alt={`${seller.firstName} profile`}
                className="h-16 w-16 rounded-full object-cover border-2 border-primary/10"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-primary/5">
                {initials || <UserIcon className="h-8 w-8" />}
              </div>
            )}
            <div
              className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                seller.isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg truncate">
                  {seller.firstName} {seller.lastName}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center">
                  <span className="truncate">@{seller.username || "username yo'q"}</span>
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground flex items-center">
                <Phone className="h-3 w-3 mr-2" />
                {seller.phoneNumber || "tel yo'q"}
              </p>
              <p className="text-xs bg-secondary/50 inline-block px-2 py-0.5 rounded-full">
                Mahsulotlar: {seller.assignedProducts?.length || 0} ta
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 flex justify-end gap-2 p-2">
        <EditSellerDialog seller={seller} />
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          O'chirish
        </Button>
      </CardFooter>
    </Card>
  );
}
