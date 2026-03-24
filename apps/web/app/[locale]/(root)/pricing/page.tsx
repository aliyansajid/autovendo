import { Separator } from "@repo/ui/src/components/separator";
import { ArrowRight, CheckCircle2, Mail, Phone } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { Link } from "@/i18n/routing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/src/components/table";
import { Badge } from "@repo/ui/src/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/src/components/card";
import { XCircle } from "lucide-react";
import { SubscribeButton } from "./_components/subscribe-button";
import { getTranslations } from "next-intl/server";

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  popular: boolean;
}

export default async function PricingPage() {
  const t = await getTranslations("PricingPage");
  const tiers = t.raw("tiers") as PricingTier[];

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">{t("title")}</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 px-4 space-y-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{t("noOverpriced")}</h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                <span className="font-semibold text-foreground">
                  autovendo.ch
                </span>
                &nbsp;{t("introText1")}
              </p>

              <p className="font-semibold text-center">{t("introText2")}</p>
            </div>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{t("comparisonTitle")}</h2>

            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold">{t("tableHeaders.package")}</TableHead>
                    <TableHead className="font-bold">{t("tableHeaders.vehicles")}</TableHead>
                    <TableHead className="font-bold">{t("tableHeaders.price")}</TableHead>
                    <TableHead className="font-bold">{t("tableHeaders.savings")}</TableHead>
                    <TableHead className="font-bold">{t("tableHeaders.monthlySavings")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Bronze</TableCell>
                    <TableCell>{t("tableRows.bronzeVehicles")}</TableCell>
                    <TableCell className="font-bold text-primary">CHF 180.–</TableCell>
                    <TableCell className="text-green-600 font-medium">{t("tableRows.bronzeSavings")}</TableCell>
                    <TableCell>ca. CHF 75.–</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Silver</TableCell>
                    <TableCell>{t("tableRows.silverVehicles")}</TableCell>
                    <TableCell className="font-bold text-primary">CHF 280.–</TableCell>
                    <TableCell className="text-green-600 font-medium">{t("tableRows.silverSavings")}</TableCell>
                    <TableCell>ca. CHF 120.–</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Gold</TableCell>
                    <TableCell>{t("tableRows.goldVehicles")}</TableCell>
                    <TableCell className="font-bold text-primary">CHF 325.–</TableCell>
                    <TableCell className="text-green-600 font-medium">{t("tableRows.goldSavings")}</TableCell>
                    <TableCell>ca. CHF 175.–</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Diamond</TableCell>
                    <TableCell>{t("tableRows.diamondVehicles")}</TableCell>
                    <TableCell className="font-bold text-primary">CHF 408.–</TableCell>
                    <TableCell className="text-green-600 font-medium">{t("tableRows.diamondSavings")}</TableCell>
                    <TableCell>ca. CHF 270.–</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{t("largerDealers.title")}</h2>
            <div className="bg-primary/5 border border-primary/20 p-8 rounded-xl space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {t("largerDealers.subtitle")}
                </h3>
                <p className="text-lg font-medium">{t("largerDealers.tagline")}</p>
              </div>
              <div className="space-y-4 text-muted-foreground text-lg">
                <p>{t("largerDealers.description1")}</p>
                <p>{t("largerDealers.description2")}</p>
              </div>

              <Separator className="bg-primary/20" />

              <div className="space-y-4">
                <h3 className="text-xl font-bold">{t("largerDealers.personalTitle")}</h3>
                <div className="space-y-4 text-muted-foreground text-lg">
                  <p>{t("largerDealers.personalDesc1")}</p>
                  <p className="font-medium text-foreground">{t("largerDealers.personalDesc2")}</p>
                  <p>{t("largerDealers.personalDesc3")}</p>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button asChild>
                    <Link href="tel:+41793223520">
                      <Phone />
                      {t("largerDealers.callButton")}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="mailto:info@autovendo.ch">
                      <Mail />
                      {t("largerDealers.emailButton")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <section className="space-y-6">
                <h2 className="text-xl font-bold">{t("whyPay.title")}</h2>
                <div className="space-y-3 text-lg text-muted-foreground">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-primary shrink-0" />
                      {t("whyPay.reach")}
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-primary shrink-0" />
                      {t("whyPay.contact")}
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-primary shrink-0" />
                      {t("whyPay.response")}
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-primary shrink-0" />
                      {t("whyPay.flexible")}
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-primary shrink-0" />
                      {t("whyPay.noCorp")}
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-primary shrink-0" />
                      {t("whyPay.fair")}
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-xl font-bold">{t("weAre.title")}</h2>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    {t("weAre.efficient")}
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    {t("weAre.dealerOriented")}
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    {t("weAre.personal")}
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    {t("weAre.transparent")}
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    {t("weAre.swiss")}
                  </li>
                </ul>
              </section>
            </div>

            <p className="font-semibold text-foreground text-lg text-center leading-relaxed">
              {t("partnershipText")
                .split("\n")
                .map((line: string, i: number) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
            </p>
          </div>
        </div>

        <Separator className="max-w-4xl mx-auto" />

        <section className="space-y-12">
          <h2 className="text-2xl font-bold text-center">{t("choosePlan")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier: PricingTier) => (
              <Card
                key={tier.name}
                className={`${tier.popular ? "border-primary" : ""}`}
              >
                <CardHeader>
                  {tier.popular ? (
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold">
                        {tier.name}
                      </CardTitle>
                      <Badge>{t("popular")}</Badge>
                    </div>
                  ) : (
                    <CardTitle className="text-xl font-bold">
                      {tier.name}
                    </CardTitle>
                  )}
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-muted-foreground">
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    {tier.features.map((feature: PricingFeature) => (
                      <div
                        key={feature.name}
                        className="flex items-start gap-3"
                      >
                        {feature.included ? (
                          <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
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
                  <SubscribeButton
                    planName={tier.name}
                    variant={tier.popular ? "default" : "outline"}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        <div className="max-w-4xl mx-auto">
          <section className="bg-linear-to-r from-primary to-primary/80 text-white p-8 md:p-12 rounded-xl space-y-8 text-center shadow-xl">
            <div>
              <h2 className="text-xl opacity-90 font-semibold mb-2">
                {t("example.label")}
              </h2>
              <p className="text-xl font-medium leading-relaxed">
                {t("example.text")}
                <span className="text-4xl font-black block my-4 tracking-tight drop-shadow-sm">
                  {t("example.highlight")}
                </span>
              </p>
              <p className="text-xl opacity-90 font-medium">
                {t("example.suffix")}
              </p>
            </div>

            <div className="pt-8 border-t border-white/20 mt-8 space-y-8">
              <p className="text-lg font-semibold leading-relaxed max-w-2xl mx-auto">
                {t("example.switchText")}
              </p>
              <Button variant="secondary" asChild>
                <Link href="/contact">
                  {t("example.contactButton")}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
