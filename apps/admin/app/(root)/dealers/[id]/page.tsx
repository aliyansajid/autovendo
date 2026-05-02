import { notFound } from "next/navigation";
import { getDealer } from "@/app/actions/dealer.actions";
import { prisma } from "@repo/db";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Building2,
  User,
  CreditCard,
  ShieldAlert,
  Calendar,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/lib/helpers/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/src/components/avatar";
import { DealerSessions } from "../_components/dealer-sessions";

interface ViewDealerPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewDealerPage({ params }: ViewDealerPageProps) {
  const { id } = await params;
  const dealer = await getDealer(id);

  if (!dealer) {
    notFound();
  }

  // Fetch subscription status
  const subscription = dealer.user?.stripeCustomerId
    ? await prisma.subscription.findFirst({
        where: {
          stripeCustomerId: dealer.user.stripeCustomerId,
          status: { in: ["active", "trialing"] },
        },
        orderBy: {
          periodStart: "desc",
        },
      })
    : null;

  const hasActiveSubscription = !!subscription;

  // Fetch active sessions
  const sessions = await prisma.session.findMany({
    where: {
      userId: dealer.userId,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dealers">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Dealer Details</h2>
            <p className="text-sm text-muted-foreground">
              Detailed information about {dealer.companyName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dealers/${id}/edit`}>Edit Profile</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="size-24">
                <AvatarImage src={getImageUrl(dealer.logo)} />
                <AvatarFallback className="text-2xl">
                  {dealer.companyName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{dealer.companyName}</CardTitle>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {dealer.user?.banned ? (
                <Badge variant="destructive">Banned</Badge>
              ) : (
                <Badge className="bg-green-500 text-white">Active</Badge>
              )}
              {hasActiveSubscription ? (
                <Badge className="bg-blue-500 text-white">
                  {subscription?.status === "trialing"
                    ? "Trial Period"
                    : "Subscribed"}
                </Badge>
              ) : (
                <Badge variant="secondary">No Subscription</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="size-4 text-muted-foreground" />
              <span className="font-medium">{dealer.contactPerson}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="size-4 text-muted-foreground" />
              <span>UID: {dealer.uidNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span>
                Joined: {new Date(dealer.createdAt).toLocaleDateString("de-CH")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Info Tabs */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="size-4" /> Contact & Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Business Email
                  </p>
                  <p className="text-sm">{dealer.businessEmail}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="text-sm">{dealer.phoneNumber}</p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" /> Location
                  </p>
                  <p className="text-sm">
                    {dealer.streetAddress}
                    <br />
                    {dealer.zipCode} {dealer.city}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account & Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="size-4" /> Account & Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Account Email
                  </p>
                  <p className="text-sm font-medium">{dealer.user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </p>
                  <p className="text-sm">
                    <Badge variant="outline" className="capitalize">
                      {dealer.user?.role}
                    </Badge>
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">
                  Subscription Details
                </h4>
                {subscription ? (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize font-medium">
                        {subscription.status}
                      </span>
                    </div>
                    {subscription.periodEnd && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Current Period Ends:
                        </span>
                        <span className="font-medium">
                          {new Date(subscription.periodEnd).toLocaleDateString(
                            "de-CH",
                          )}
                        </span>
                      </div>
                    )}
                    {subscription.cancelAtPeriodEnd && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                        <ShieldAlert className="size-3" />
                        Cancels at end of period
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No active subscription found for this dealer.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="size-4" /> Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DealerSessions userId={dealer.userId} sessions={sessions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
