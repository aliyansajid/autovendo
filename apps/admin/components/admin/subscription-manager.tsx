"use client";

import { useState, useTransition } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Input } from "@repo/ui/src/components/input";
import { Label } from "@repo/ui/components/label";
import { updateDealerSubscription } from "@/app/actions/dealer.actions";
import { toast } from "sonner";
import { CalendarDays, Save, Sparkles } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface SubscriptionManagerProps {
  dealerId: string;
  currentPlan: string;
  plans: Plan[];
}

export function SubscriptionManager({
  dealerId,
  currentPlan,
  plans,
}: SubscriptionManagerProps) {
  const [selectedPlan, setSelectedPlan] = useState(
    currentPlan || plans[0]?.name || "",
  );
  const [days, setDays] = useState(30);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateDealerSubscription(
        dealerId,
        selectedPlan,
        days,
      );
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleQuickGrant = (quickDays: number) => {
    setDays(quickDays);
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        Modify Subscription
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Select Plan</Label>
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger>
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.name}>
                  {plan.name} (CHF {plan.price.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Duration (Days)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="flex-1"
            />
            <Button variant="outline" size="icon" disabled={isPending}>
              <CalendarDays />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => handleQuickGrant(30)}
              disabled={isPending}
            >
              30 Days
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => handleQuickGrant(90)}
              disabled={isPending}
            >
              90 Days
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => handleQuickGrant(365)}
              disabled={isPending}
            >
              1 Year
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleUpdate} disabled={isPending}>
          <Save />
          Update Subscription
        </Button>
      </div>
    </div>
  );
}
