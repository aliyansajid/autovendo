import { Button } from "@repo/ui/components/button";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getDealerVehicles } from "@/app/actions/vehicles.actions";
import { VehicleList } from "./_components/vehicle-list";
import { getTranslations } from "next-intl/server";

export default async function VehiclesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations("VehiclesPage");

  const vehicles = await getDealerVehicles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("pageTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("pageSubtitle")}</p>
        </div>

        <Button asChild>
          <Link href="/dashboard/vehicles/new" locale={locale}>
            <Plus />
            {t("newListing")}
          </Link>
        </Button>
      </div>

      <VehicleList vehicles={vehicles as any} />
    </div>
  );
}
