import { prisma } from "@repo/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: {
      periodStart: "desc",
    },
  });

  // Fetch users and dealers for these subscriptions
  const stripeCustomerIds = subscriptions
    .map((s) => s.stripeCustomerId)
    .filter((id): id is string => !!id);

  const users = await prisma.user.findMany({
    where: {
      stripeCustomerId: { in: stripeCustomerIds },
    },
    include: {
      dealer: true,
    },
  });

  const userMap = new Map(users.map((u) => [u.stripeCustomerId, u]));

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscriptions</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dealer / Company</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trial Period</TableHead>
              <TableHead>Period Start</TableHead>
              <TableHead>Period End</TableHead>
              <TableHead>Auto-Renew</TableHead>
              <TableHead>Canceled / Ended</TableHead>
              <TableHead>Stripe ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No subscriptions found.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub) => {
                const user = sub.stripeCustomerId
                  ? userMap.get(sub.stripeCustomerId)
                  : null;
                const dealer = user?.dealer;

                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>
                          {dealer?.companyName || user?.name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{sub.plan}</TableCell>
                    <TableCell className="capitalize">
                      {sub.billingInterval || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          sub.status === "active"
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : sub.status === "trialing"
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : sub.status === "canceled"
                                ? "bg-destructive text-white"
                                : "secondary"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.trialStart || sub.trialEnd ? (
                        <div className="flex flex-col text-xs">
                          <span>
                            Start:{" "}
                            {sub.trialStart
                              ? new Date(sub.trialStart).toLocaleDateString(
                                  "de-CH",
                                )
                              : "-"}
                          </span>
                          <span>
                            End:{" "}
                            {sub.trialEnd
                              ? new Date(sub.trialEnd).toLocaleDateString(
                                  "de-CH",
                                )
                              : "-"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.periodStart
                        ? new Date(sub.periodStart).toLocaleDateString("de-CH")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {sub.periodEnd
                        ? new Date(sub.periodEnd).toLocaleDateString("de-CH")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {sub.cancelAtPeriodEnd ? (
                        <Badge variant="destructive">Off</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200 bg-green-50"
                        >
                          On
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        {sub.canceledAt && (
                          <span className="text-destructive">
                            Canceled:{" "}
                            {new Date(sub.canceledAt).toLocaleDateString(
                              "de-CH",
                            )}
                          </span>
                        )}
                        {sub.endedAt && (
                          <span className="text-muted-foreground">
                            Ended:{" "}
                            {new Date(sub.endedAt).toLocaleDateString("de-CH")}
                          </span>
                        )}
                        {!sub.canceledAt && !sub.endedAt && <span>-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {sub.stripeSubscriptionId || "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
