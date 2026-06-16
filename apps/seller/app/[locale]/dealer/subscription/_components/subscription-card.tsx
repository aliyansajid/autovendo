"use client";

import { openBillingPortal } from "@/lib/api/auth-client";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/components/card";
import { Spinner } from "@repo/ui/components/spinner";
import { Badge } from "@repo/ui/components/badge";
import { Progress } from "@repo/ui/components/progress";
import { useTransition } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { CreditCard, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDate } from "@repo/ui/lib/helpers/format";

import type { SubscriptionData } from "@/lib/api/vehicles";

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
  const params = useParams();
  const locale = (params.locale as string) || "de";
  const t = useTranslations("SubscriptionCard");

  const activeSubscription = subscriptions.find((s) =>
    ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(
      s.status,
    ),
  );

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "trialing":
        return {
          label: t("statusTrialing"),
          color: "bg-blue-500 hover:bg-blue-600",
        };
      case "past_due":
      case "unpaid":
        return {
          label: t("statusPastDue"),
          color: "bg-red-500 hover:bg-red-600",
        };
      case "incomplete":
        return {
          label: t("statusIncomplete"),
          color: "bg-yellow-500 hover:bg-yellow-600",
        };
      default:
        return {
          label: t("statusActive"),
          color: "bg-green-500 hover:bg-green-600",
        };
    }
  };

  const statusInfo = activeSubscription
    ? getStatusInfo(activeSubscription.status)
    : null;

  const handleManageBilling = () => {
    startTransition(async () => {
      const { data, error } = await openBillingPortal({
        returnUrl: window.location.href,
      });

      if (error) {
        toast.error(error.message || t("billingError"));
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
        <CardDescription>{t("cardDesc")}</CardDescription>
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
                    ? t("nextBilling", {
                        date: formatDate(
                          new Date(activeSubscription.periodEnd),
                          locale,
                        ),
                      })
                    : t("activeSubscription")}
              </p>
            </div>
            <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
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
            <Progress value={maxVehicles > 0 ? (currentCount / maxVehicles) * 100 : 0} className="h-2" />
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
