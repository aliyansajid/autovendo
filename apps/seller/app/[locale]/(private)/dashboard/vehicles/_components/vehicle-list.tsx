"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Trash2,
  MoreHorizontal,
  Send,
  FileText,
  Pencil,
  CheckCircle2,
  Search,
} from "lucide-react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { getImageUrl } from "@repo/ui/lib/helpers/image";
import {
  apiDeleteVehicle,
  apiUpdateVehicleStatus,
  apiCreateListingCheckout,
} from "@/lib/api/seller-vehicles";
import { toast } from "sonner";
import { useState, useMemo, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@repo/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@repo/ui/components/input-group";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  formatPrice,
  formatKilometers,
  formatRegistrationDate,
  formatDate,
} from "@repo/ui/lib/helpers/format";

interface Vehicle {
  id: string;
  make: string;
  model: string | null;
  version: string | null;
  price: number;
  kilometer: number;
  registrationMonth: number;
  registrationYear: number;
  bodyType: string;
  color: string;
  images: string[];
  createdAt: Date;
  status: string;
  listingPaidAt: Date | null;
  listingPlan: string | null;
}

const statusVariantMap: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  PAUSED: "outline",
  SOLD: "outline",
  ARCHIVED: "outline",
  BANNED: "destructive",
};

/**
 * Vehicle List Component (Client-side)
 *
 * Features:
 * - Tabular view of all seller vehicles
 * - Real-time filtering by brand, model, and version
 * - Direct actions for editing and deleting vehicles
 * - Formatted display using Swiss (de-CH) technical standards
 */
export function VehicleList({ vehicles }: { vehicles: Vehicle[] }) {
  const t = useTranslations("VehicleList");
  const params = useParams();
  const locale = (params.locale as string) || "de";
  const router = useRouter();

  // State for the real-time search/filter input
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVehicles = useMemo(() => {
    if (!searchQuery) return vehicles;
    const query = searchQuery.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.make.toLowerCase().includes(query) ||
        (v.model?.toLowerCase() || "").includes(query) ||
        (v.version?.toLowerCase() || "").includes(query),
    );
  }, [vehicles, searchQuery]);

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/20">
        <h3 className="text-lg font-semibold">{t("emptyTitle")}</h3>
        <p className="text-muted-foreground">{t("emptyText")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InputGroup className="sm:max-w-sm">
        <InputGroupInput
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      {filteredVehicles.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/20">
          <Search className="size-8 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium">{t("noSearchResults")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("noSearchResultsHint")}
          </p>
        </div>
      ) : (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">{t("colImage")}</TableHead>
              <TableHead>{t("colVehicle")}</TableHead>
              <TableHead>{t("colPrice")}</TableHead>
              <TableHead>{t("colKilometer")}</TableHead>
              <TableHead>{t("colRegistration")}</TableHead>
              <TableHead>{t("colBody")}</TableHead>
              <TableHead>{t("colColor")}</TableHead>
              <TableHead>{t("colCreated")}</TableHead>
              <TableHead>{t("colStatus")}</TableHead>
              <TableHead className="text-right">{t("colActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                    {vehicle.images?.[0] ? (
                      <Image
                        src={getImageUrl(vehicle.images[0])}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                        {t("noImage")}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  <span className="flex items-center gap-2">
                    {vehicle.make}
                    {vehicle.model ? ` ${vehicle.model}` : ""}
                  </span>
                </TableCell>
                <TableCell className="font-semibold whitespace-nowrap">
                  {formatPrice(vehicle.price)}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatKilometers(vehicle.kilometer)}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatRegistrationDate(
                    vehicle.registrationMonth,
                    vehicle.registrationYear,
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap capitalize">
                  {vehicle.bodyType?.replace(/-/g, " ") || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap capitalize">
                  {vehicle.color?.toLowerCase() || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDate(new Date(vehicle.createdAt), locale)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariantMap[vehicle.status] || "outline"}
                  >
                    {t(`status_${vehicle.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <VehicleActions vehicle={vehicle} t={t} router={router} locale={locale} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}
    </div>
  );
}

function VehicleActions({
  vehicle,
  t,
  router,
  locale,
}: {
  vehicle: Vehicle;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  router: ReturnType<typeof import("@/i18n/routing").useRouter>;
  locale: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusUpdate = (newStatus: "DRAFT" | "SOLD") => {
    startTransition(async () => {
      try {
        await apiUpdateVehicleStatus(vehicle.id, newStatus);
        toast.success(t("statusUpdateSuccess"));
        router.refresh();
      } catch {
        toast.error(t("statusUpdateError"));
      }
    });
  };

  const handlePublish = () => {
    startTransition(async () => {
      try {
        if (vehicle.listingPaidAt) {
          await apiUpdateVehicleStatus(vehicle.id, "PUBLISHED");
          toast.success(t("statusUpdateSuccess"));
          router.refresh();
        } else {
          const plan = (vehicle.listingPlan as "standard" | "best_value") || "standard";
          const checkoutUrl = await apiCreateListingCheckout(vehicle.id, plan, locale);
          window.location.href = checkoutUrl;
        }
      } catch {
        toast.error(t("statusUpdateError"));
      }
    });
  };

  const isStateRestricted = ["SOLD", "ARCHIVED", "BANNED", "PAUSED"].includes(
    vehicle.status,
  );

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            asChild
            disabled={isStateRestricted || isPending}
          >
            <Link href={`/dashboard/vehicles/${vehicle.id}`}>
              <Pencil />
              {t("edit")}
            </Link>
          </DropdownMenuItem>

          {vehicle.status === "DRAFT" && (
            <DropdownMenuItem
              onSelect={() => handlePublish()}
              disabled={isStateRestricted || isPending}
            >
              <Send />
              {vehicle.listingPaidAt ? t("publish") : t("payAndPublish")}
            </DropdownMenuItem>
          )}

          {vehicle.status === "PUBLISHED" && (
            <>
              <DropdownMenuItem
                onSelect={() => handleStatusUpdate("DRAFT")}
                disabled={isStateRestricted || isPending}
              >
                <FileText />
                {t("statusDraft")}
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() => handleStatusUpdate("SOLD")}
                disabled={isStateRestricted || isPending}
              >
                <CheckCircle2 className="text-green-600" />
                {t("statusSold")}
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive focus:text-destructive"
                disabled={isPending}
              >
                <Trash2 />
                {t("delete")}
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteDesc")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={async () => {
                    if (isDeleting) return;
                    setIsDeleting(true);
                    try {
                      await apiDeleteVehicle(vehicle.id);
                      toast.success(t("deleteSuccess"));
                      router.refresh();
                    } catch {
                      toast.error(t("deleteError"));
                      setIsDeleting(false);
                    }
                  }}
                >
                  {t("delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
