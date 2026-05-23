import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { getSellerProfile } from "@/app/actions/seller.actions";
import { VehicleForm } from "../_components/vehicle-form";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@repo/ui/src/components/button";

export default async function AddNewVehiclePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations("NewVehiclePage");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const sellerProfile = session?.user?.id ? await getSellerProfile() : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 items-start">
        <Button variant={"link"} asChild>
          <Link href="/dashboard/vehicles">
            <ArrowLeft />
            {t("back")}
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>
      <VehicleForm sellerProfile={sellerProfile} />
    </div>
  );
}
