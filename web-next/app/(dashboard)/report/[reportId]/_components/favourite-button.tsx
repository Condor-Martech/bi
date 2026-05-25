"use client";

import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useMyFavourites, useToggleFavourite } from "@/lib/hooks/favourites";

interface FavouriteButtonProps {
  reportIdPB: string;
}

export function FavouriteButton({ reportIdPB }: FavouriteButtonProps) {
  const { data: favourites = [], isPending } = useMyFavourites();
  const toggle = useToggleFavourite();

  const existing = favourites.find((f) => f.reportIdPB === reportIdPB);
  const isFavourite = Boolean(existing);
  const nextOrder = favourites.reduce((max, f) => Math.max(max, f.order ?? 0), 0) + 1;

  function onClick() {
    toggle.mutate(
      { reportIdPB, existing, nextOrder },
      {
        onSuccess: (res) => {
          toast.success(
            res.action === "added" ? "Agregado a favoritos." : "Quitado de favoritos.",
          );
        },
        onError: () => toast.error("No se pudo actualizar el favorito."),
      },
    );
  }

  return (
    <Button
      variant={isFavourite ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={isPending || toggle.isPending}
      className="gap-1.5"
      aria-pressed={isFavourite}
    >
      <Star
        className={`size-3.5 ${isFavourite ? "fill-twenty-orange text-twenty-orange" : ""}`}
      />
      {isFavourite ? "Favorito" : "Favoritar"}
    </Button>
  );
}
