import { pricingTiers } from "@/constants/pricing-tiers";
import { Button } from "@repo/ui/src/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/src/components/card";
import { Badge, CheckCircle2, XCircle } from "lucide-react";
import React from "react";

const PricingPage = () => {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 md:py-24 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold">Unsere Preise</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto">
              Fair, transparent und ohne versteckte Kosten. Finden Sie das
              passende Paket für Ihre Bedürfnisse.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 md:py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`${
                tier.popular
                  ? "border-primary shadow-lg scale-100 lg:scale-105 z-10"
                  : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  {tier.popular && <Badge>Beliebt</Badge>}
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-muted-foreground">{tier.period}</span>
                  )}
                </div>
                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                >
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default PricingPage;
