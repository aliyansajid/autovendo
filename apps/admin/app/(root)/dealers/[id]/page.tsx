import { notFound } from "next/navigation";
import { getDealer, getDealerSubscription } from "@/app/actions/dealer.actions";
import { getPlans } from "@/app/actions/plan.actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/src/components/card";
import { Badge } from "@repo/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/src/components/avatar";
import { getImageUrl } from "@/lib/helpers/image";
import { DealerActions } from "@/app/(root)/dealers/_components/dealer-actions";
import { SubscriptionManager } from "@/app/(root)/dealers/_components/subscription-manager";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Building2,
} from "lucide-react";

interface DealerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealerDetailPage({
  params,
}: DealerDetailPageProps) {
  const { id } = await params;
  const dealer = await getDealer(id);

  if (!dealer) {
    notFound();
  }

  const [subscription, plans] = await Promise.all([
    getDealerSubscription(dealer.userId),
    getPlans(),
  ]);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-2 border-primary/10">
            <AvatarImage src={getImageUrl(dealer.logo)} />
            <AvatarFallback className="text-xl">
              {dealer.companyName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-bold">{dealer.companyName}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="size-4" />
              <span>{dealer.uidNumber}</span>
            </div>
          </div>
        </div>
        <DealerActions
          userId={dealer.userId}
          userRole={dealer.user.role || "user"}
          isBanned={!!dealer.user.banned}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Business Email
                </span>
                <span>{dealer.businessEmail}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Phone
                </span>
                <span>{dealer.phoneNumber}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Contact Person
                </span>
                <span>{dealer.contactPerson}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Address
                </span>
                <span>
                  {dealer.streetAddress}, {dealer.zipCode} {dealer.city}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage this dealer's active plan and trial period.
              </CardDescription>
            </div>
            {subscription?.status === "active" ? (
              <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">
                  Current Plan
                </span>
                <p className="text-2xl font-bold uppercase">
                  {subscription?.plan || "No Plan"}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Ends On</span>
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-muted-foreground" />
                  <p className="text-xl font-semibold">
                    {subscription?.periodEnd
                      ? new Date(subscription.periodEnd).toLocaleDateString(
                          "de-CH",
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <SubscriptionManager
              dealerId={dealer.id}
              currentPlan={subscription?.plan || ""}
              plans={plans}
            />
          </CardContent>
        </Card>
      </div>

      {/* Auth Info */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>
            System-level account details for this dealer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Role</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    dealer.user.role === "admin" ? "default" : "secondary"
                  }
                >
                  {dealer.user.role || "user"}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                Email Verified
              </span>
              <div className="flex items-center gap-2">
                {dealer.user.emailVerified ? (
                  <CheckCircle2 className="size-5 text-green-500" />
                ) : (
                  <XCircle className="size-5 text-destructive" />
                )}
                <span>
                  {dealer.user.emailVerified ? "Verified" : "Not Verified"}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">User ID</span>
              <p className="font-mono text-xs break-all text-muted-foreground">
                {dealer.userId}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Joined At</span>
              <p>
                {new Date(dealer.createdAt).toLocaleDateString("de-CH")} at{" "}
                {new Date(dealer.createdAt).toLocaleTimeString("de-CH")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
