"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Button } from "@repo/ui/components/button";
import { Edit, Trash2, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getImageUrl } from "@/lib/helpers/image";
import {
  deleteVehicle,
  type SubscriptionStatus,
} from "@/app/actions/vehicles.actions";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
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
import { Badge } from "@repo/ui/components/badge";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  formatPrice,
  formatNumber,
  formatDateTime,
} from "@/lib/helpers/format";

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
}

export function VehicleList({
  vehicles,
  subscriptionStatus,
}: {
  vehicles: Vehicle[];
  subscriptionStatus?: SubscriptionStatus;
}) {
  const t = useTranslations("VehicleList");
  const params = useParams();
  const locale = (params.locale as string) || "de";
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const isExpiredGraceDone =
    subscriptionStatus?.type === "expired" && subscriptionStatus.isGraceExpired;

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
        <p className="text-muted-foreground mb-6">{t("emptyText")}</p>
        {!isExpiredGraceDone &&
          subscriptionStatus?.type !== "no_subscription" &&
          subscriptionStatus?.type !== "quota_exhausted" && (
            <Button asChild>
              <Link href="/dashboard/vehicles/new">{t("newListing")}</Link>
            </Button>
          )}
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
                <TableCell className="flex items-center gap-2 font-medium whitespace-nowrap">
                  {vehicle.make}
                  {vehicle.model ? ` ${vehicle.model}` : ""}
                </TableCell>
                <TableCell className="font-semibold whitespace-nowrap">
                  {formatPrice(vehicle.price, locale)}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatNumber(vehicle.kilometer, locale)} km
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {vehicle.registrationMonth.toString().padStart(2, "0")}/
                  {vehicle.registrationYear}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap capitalize">
                  {vehicle.bodyType?.replace(/-/g, " ") || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap capitalize">
                  {vehicle.color?.toLowerCase() || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDateTime(new Date(vehicle.createdAt), locale, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                        <Edit />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("deleteTitle")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("deleteDesc")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={async () => {
                              try {
                                await deleteVehicle(vehicle.id);
                                toast.success(t("deleteSuccess"));
                                router.refresh();
                              } catch (error) {
                                toast.error(t("deleteError"));
                              }
                            }}
                          >
                            {t("delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
