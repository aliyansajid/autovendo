import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { getDealerProfile } from "@/app/actions/dealer.actions";
import { getVehicleById, getVehicleSubscriptionStatus } from "@/app/actions/vehicles.actions";import { VehicleForm } from "../_components/vehicle-form";
import { mapVehicleToForm } from "@/lib/helpers/vehicle";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [dealerProfile, vehicle, subscriptionStatus] = await Promise.all([
    session?.user?.id ? getDealerProfile(session.user.id) : null,
    getVehicleById(id),
    getVehicleSubscriptionStatus(),
  ]);

  if (!vehicle) {
    notFound();
  }

  const initialData = mapVehicleToForm(vehicle);

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
          <h1 className="text-2xl font-bold">Inserat bearbeiten</h1>
          <p className="text-sm text-muted-foreground">
            Aktualisieren Sie die Details Ihres Fahrzeugs.
          </p>
        </div>
      </div>
      <VehicleForm
        dealerProfile={dealerProfile}
        initialData={initialData}
        vehicleId={id}
        subscriptionStatus={subscriptionStatus}
      />
    </div>
  );
}
