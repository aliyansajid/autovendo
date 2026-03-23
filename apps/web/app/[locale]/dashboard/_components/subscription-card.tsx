"use client";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/src/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/src/components/card";
import { Spinner } from "@repo/ui/src/components/spinner";
import { Badge } from "@repo/ui/src/components/badge";
import { Progress } from "@repo/ui/src/components/progress";
import { useTransition } from "react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { CreditCard, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

type SubscriptionData = {
  id: string;
  plan: string;
  status: string;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

interface SubscriptionCardProps {
  subscriptions: SubscriptionData[];
  currentCount: number;
  maxVehicles: number;
  hasSubscription: boolean;
}

export function SubscriptionCard({
  subscriptions,
  currentCount,
  maxVehicles,
  hasSubscription,
}: SubscriptionCardProps) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("SubscriptionCard");

  const activeSubscription = subscriptions.find(
    (s) => s.status === "active" || s.status === "trialing",
  );

  const handleManageBilling = () => {
    startTransition(async () => {
      const { data, error } = await authClient.subscription.billingPortal({
        returnUrl: window.location.href,
      });

      if (error) {
        toast.error(
          error.message || t("billingError"),
        );
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          {t("cardTitle")}
        </CardTitle>
        <CardDescription>
          {t("cardDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeSubscription ? (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-1">
              <p className="font-semibold capitalize">
                {activeSubscription.plan} Plan
              </p>
              <p className="text-sm text-muted-foreground">
                {activeSubscription.cancelAtPeriodEnd
                  ? t("cancelAtPeriodEnd")
                  : activeSubscription.periodEnd
                    ? t("nextBilling", { date: format(new Date(activeSubscription.periodEnd), "dd.MM.yyyy") })
                    : t("activeSubscription")}
              </p>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600">
              {activeSubscription.status === "trialing" ? t("statusTrialing") : t("statusActive")}
            </Badge>
          </div>
        ) : (
          <div className="p-4 border border-dashed rounded-lg text-center space-y-2">
            <p className="text-muted-foreground">{t("noSubscription")}</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing">{t("viewPlans")}</Link>
            </Button>
          </div>
        )}

        {hasSubscription && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("quota")}</span>
              <span className="font-medium">
                {t("quotaUsed", { current: currentCount, max: maxVehicles })}
              </span>
            </div>
            <Progress value={(currentCount / maxVehicles) * 100} className="h-2" />
          </div>
        )}
      </CardContent>
      {activeSubscription && (
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={handleManageBilling}
          >
            {isPending ? (
              <>
                <Spinner />
                {t("billingOpening")}
              </>
            ) : (
              <>
                {t("manageBilling")}
                <ExternalLink />
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
