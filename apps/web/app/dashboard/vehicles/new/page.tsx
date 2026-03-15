import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { getDealerProfile } from "@/app/actions/dealer.actions";
import { VehicleForm } from "./_components/vehicle-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AddNewVehiclePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const dealerProfile = session?.user?.id
    ? await getDealerProfile(session.user.id)
    : null;

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
      <VehicleForm dealerProfile={dealerProfile} />
    </div>
  );
}
