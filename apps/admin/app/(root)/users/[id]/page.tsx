import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { getDealerSubscription } from "@/app/actions/dealer.actions";
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
import { UserActions } from "@/components/admin/user-actions";
import { SubscriptionManager } from "@/components/admin/subscription-manager";
import {
  CheckCircle2,
  Clock,
  Mail,
  Calendar,
  Shield,
  Building2,
} from "lucide-react";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  // Get User from Better Auth / Prisma
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      dealer: true,
    },
  });

  if (!user) {
    notFound();
  }

  const [subscription, plans] = await Promise.all([
    getDealerSubscription(user.id),
    getPlans(),
  ]);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-2 border-primary/10">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="text-xl">
              {user.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
        <UserActions
          userId={user.id}
          userRole={user.role || "user"}
          isBanned={!!user.banned}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="size-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Role
                </span>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                  className="w-fit"
                >
                  {user.role || "user"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Email Verification
                </span>
                <div className="flex items-center gap-1">
                  {user.emailVerified ? (
                    <Badge
                      variant="outline"
                      className="text-green-600 bg-green-50 border-green-200"
                    >
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-destructive bg-destructive/10 border-destructive/20"
                    >
                      Not Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Joined At
                </span>
                <span>
                  {new Date(user.createdAt).toLocaleDateString("de-CH")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dealer / Subscription Info */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Business & Subscription</CardTitle>
              <CardDescription>
                {user.dealer
                  ? `Associated with ${user.dealer.companyName}`
                  : "No business profile associated with this user."}
              </CardDescription>
            </div>
            {subscription?.status === "active" ? (
              <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {user.dealer && (
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
            )}

            {user.dealer ? (
              <SubscriptionManager
                dealerId={user.dealer.id}
                currentPlan={subscription?.plan || ""}
                plans={plans}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed">
                <Building2 className="size-10 text-muted-foreground mb-2 opacity-20" />
                <p className="text-muted-foreground text-sm italic">
                  Subscription management is only available for Dealer accounts.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
