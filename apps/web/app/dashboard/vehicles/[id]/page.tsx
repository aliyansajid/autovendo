import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { getDealerProfile } from "@/app/actions/dealer.actions";
import { getVehicleById } from "@/app/actions/vehicle.actions";
import { VehicleForm } from "../new/_components/vehicle-form";
import { mapVehicleToForm } from "@/lib/utils/vehicle-mapping";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const dealerProfile = session?.user?.id
    ? await getDealerProfile(session.user.id)
    : null;

  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  const initialData = mapVehicleToForm(vehicle);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Button variant="link" asChild>
          <Link href="/dashboard/vehicles" className="flex items-center">
            <ArrowLeft />
            Zurück zur Übersicht
          </Link>
        </Button>

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
      />
    </div>
  );
}
