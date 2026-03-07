import React from "react";
import { DealerForm } from "../_components/dealer-form";

export default function NewDealerPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Add New Dealer</h2>
        <p className="text-muted-foreground">
          Fill in the form below to add a new dealer.
        </p>
      </div>
      <DealerForm />
    </div>
  );
}
