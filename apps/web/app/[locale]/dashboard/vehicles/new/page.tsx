import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { getDealerProfile } from "@/app/actions/dealer.actions";
import { getVehicleSubscriptionStatus } from "@/app/actions/vehicles.actions";
import { VehicleForm } from "../_components/vehicle-form";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export default async function AddNewVehiclePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [dealerProfile, subscriptionStatus] = await Promise.all([
    session?.user?.id ? getDealerProfile(session.user.id) : null,
    getVehicleSubscriptionStatus(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/vehicles"
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Fahrzeug inserieren</h1>
          <p className="text-sm text-muted-foreground">
            Geben Sie die Details Ihres Fahrzeugs ein, um es auf dem Marktplatz
            zu inserieren.
          </p>
        </div>
      </div>
      <VehicleForm dealerProfile={dealerProfile} subscriptionStatus={subscriptionStatus} />
    </div>
  );
}
