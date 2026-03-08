"use client";

import { authClient } from "@repo/auth/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import { Badge } from "@repo/ui/src/components/badge";
import { useEffect, useState } from "react";
import { Car, CreditCard, Users } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const { data, error } = await authClient.subscription.list();
      if (!error && data) {
        setSubscriptions(data);
      }
      setIsLoading(false);
    };
    fetchSubscriptions();
  }, []);

  const activeSubscription = subscriptions.find(
    (sub) => sub.status === "active" || sub.status === "trialing",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Willkommen zurück, {session?.user.name}!
        </h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihren Fahrzeughandel und Ihr Abonnement an einem Ort.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktives Paket</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {activeSubscription
                ? `${activeSubscription.plan} Plan`
                : "Kein Abo"}
            </div>
            {activeSubscription && (
              <Badge className="mt-2 bg-green-500 hover:bg-green-600">
                {activeSubscription.status === "trialing"
                  ? "Testphase"
                  : "Aktiv"}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fahrzeuge</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Eingestellte Fahrzeuge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Besucher</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Aufrufe Ihrer Inserate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">
              Noch keine Aktivitäten vorhanden.
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
            <CardDescription>Häufig genutzte Funktionen</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2"></CardContent>
        </Card>
      </div>
    </div>
  );
}
