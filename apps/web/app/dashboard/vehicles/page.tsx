import { Button } from "@repo/ui/src/components/button";
import { Plus, AlertCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getDealerVehicles, getVehicleSubscriptionStatus } from "@/app/actions/vehicles.actions";import { VehicleList } from "./_components/vehicle-list";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/src/components/alert";
import { format } from "date-fns";

export default async function VehiclesPage() {
  const [vehicles, subscriptionStatus] = await Promise.all([
    getDealerVehicles(),
    getVehicleSubscriptionStatus(),
  ]);

  const isBlocked =
    subscriptionStatus.type === "no_subscription" ||
    subscriptionStatus.type === "quota_exhausted" ||
    subscriptionStatus.type === "expired";

  return (
    <div className="space-y-6">
      {/* Grace period — subscription expired but still within 7 days */}
      {subscriptionStatus.type === "expired" &&
        !subscriptionStatus.isGraceExpired &&
        subscriptionStatus.graceEnd && (
          <Alert className="border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-400 [&>svg]:text-yellow-500">
            <AlertTriangle />
            <AlertTitle>Abonnement abgelaufen</AlertTitle>
            <AlertDescription>
              Ihr Abonnement ist abgelaufen. Ihre Inserate werden am{" "}
              <strong>
                {format(new Date(subscriptionStatus.graceEnd), "dd.MM.yyyy")}
              </strong>{" "}
              deaktiviert. Bitte erneuern Sie Ihr Abo, um aktiv zu bleiben.
            </AlertDescription>
          </Alert>
        )}

      {/* No subscription or grace period has expired */}
      {(subscriptionStatus.type === "no_subscription" ||
        (subscriptionStatus.type === "expired" &&
          subscriptionStatus.isGraceExpired)) && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Kein aktives Abonnement</AlertTitle>
          <AlertDescription>
            {subscriptionStatus.type === "no_subscription"
              ? "Sie haben kein aktives Abonnement. Wählen Sie einen Plan, um Fahrzeuge zu inserieren."
              : "Ihr Abonnement ist abgelaufen und Ihre Inserate wurden deaktiviert. Bitte erneuern Sie Ihr Abo."}
          </AlertDescription>
        </Alert>
      )}

      {/* Quota exhausted */}
      {subscriptionStatus.type === "quota_exhausted" && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Inseratskontingent ausgeschöpft</AlertTitle>
          <AlertDescription>
            Sie haben das maximale Kontingent Ihres Plans ({subscriptionStatus.plan}) erreicht ({subscriptionStatus.currentCount}/{subscriptionStatus.maxVehicles} Inserate). Bitte upgraden Sie Ihr Abonnement.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Alle Fahrzeuge</h1>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie Ihre inserierten Fahrzeuge und deren Status.
          </p>
        </div>

        {isBlocked ? (
          <Button disabled>
            <Plus />
            Neues Inserat
          </Button>
        ) : (
          <Button asChild>
            <Link href="/dashboard/vehicles/new">
              <Plus />
              Neues Inserat
            </Link>
          </Button>
        )}
      </div>

      <VehicleList
        vehicles={vehicles as any}
        subscriptionStatus={subscriptionStatus}
      />
    </div>
  );
}
