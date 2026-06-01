import { Plus, Edit } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { PlanFormDialog } from "./_components/plan-form-dialog";
import { DeletePlanButton } from "./_components/delete-plan-button";
import { serverFetch } from "@/lib/api/client";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const res = await serverFetch("/api/admin/plans");
  const plans: any[] = res.ok ? await res.json() : [];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscription Plans</h2>
        <PlanFormDialog>
          <Button>
            <Plus />
            Add Plan
          </Button>
        </PlanFormDialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stripe Price ID</TableHead>
              <TableHead>Vehicle Limit</TableHead>
              <TableHead>Trial</TableHead>
              <TableHead>Trial Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No plans found.
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    {plan.name}
                    {plan.popular && (
                      <Badge variant="secondary" className="ml-2">
                        Popular
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("de-CH", {
                      style: "currency",
                      currency: "CHF",
                    }).format(plan.price)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {plan.priceId}
                  </TableCell>
                  <TableCell>
                    {(plan.limits as any)?.vehicles ?? 0} vehicles
                  </TableCell>
                  <TableCell>
                    {plan.hasTrial ? (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>{plan.hasTrial ? plan.trialDays : "-"}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <PlanFormDialog plan={plan}>
                        <Button variant="ghost" size="icon">
                          <Edit />
                        </Button>
                      </PlanFormDialog>
                      <DeletePlanButton id={plan.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
