import { Button } from "@repo/ui/src/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getDealerVehicles } from "@/app/actions/vehicle.actions";
import { VehicleList } from "./_components/vehicle-list";

export default async function VehiclesPage() {
  const vehicles = await getDealerVehicles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Alle Fahrzeuge</h1>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie Ihre inserierten Fahrzeuge und deren Status.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/vehicles/new">
            <Plus />
            Neues Inserat
          </Link>
        </Button>
      </div>

      <VehicleList vehicles={vehicles as any} />
    </div>
  );
}
