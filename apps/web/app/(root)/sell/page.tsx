import { Badge } from "@repo/ui/src/components/badge";
import { Button } from "@repo/ui/src/components/button";
import { Card, CardContent } from "@repo/ui/src/components/card";
import { Separator } from "@repo/ui/src/components/separator";
import {
  Check,
  X,
  Car,
  Banknote,
  Camera,
  Sun,
  MapPin,
  type LucideIcon,
} from "lucide-react";

export default function SellPage() {
  return (
    <>
      <section className="relative w-full bg-[url('https://images.pexels.com/photos/7144172/pexels-photo-7144172.jpeg')] bg-cover bg-position-[80%_20%]">
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-285 mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Want to sell your vehicle?
          </h1>

          <p className="text-lg text-white/90 mb-8 font-medium">
            Autovendo — the largest Swiss marketplace for vehicles.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button>Advertise now</Button>
            <Button variant="outline">Learn more</Button>
          </div>
        </div>
      </section>

      <section className="max-w-285 mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          <span className="inline-block border-b-4 border-primary pb-1">
            How
          </span>
          &nbsp;would you like to sell your car?
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="pt-0">
            <CardContent className="space-y-6">
              <Car className="size-24 mx-auto" strokeWidth={1} />

              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-bold">
                  Advertise and sell privately
                </h3>
                <p className="text-sm text-muted-foreground font-semibold uppercase">
                  BEST POSSIBLE SALES PRICE
                </p>
              </div>

              <p className="text-muted-foreground">
                Take photos yourself, arrange test drives, and answer all
                inquiries personally. This is how you get the best price for
                your vehicle.
              </p>

              <Badge variant="secondary" className="px-3 py-1 text-sm">
                Advertising for 14 days starting at CHF 69.-
              </Badge>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button>Advertise now</Button>
                <Button variant="ghost">Learn more</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="pt-0">
            <CardContent className="space-y-6">
              <Car className="size-24 mx-auto" strokeWidth={1} />

              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-bold">
                  Advertise and sell privately
                </h3>
                <p className="text-sm text-muted-foreground font-semibold uppercase">
                  BEST POSSIBLE SALES PRICE
                </p>
              </div>

              <p className="text-muted-foreground">
                Take photos yourself, arrange test drives, and answer all
                inquiries personally. This is how you get the best price for
                your vehicle.
              </p>

              <Badge variant="secondary" className="px-3 py-1 text-sm">
                Advertising for 14 days starting at CHF 69.-
              </Badge>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button>Advertise now</Button>
                <Button variant="ghost">Learn more</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="max-w-285 mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              Compare and&nbsp;
              <span className="inline-block border-b-4 border-primary pb-1">
                decide
              </span>
              &nbsp;for yourself
            </h2>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    ab CHF 69.-
                  </Badge>
                  <h3 className="text-xl font-bold">Ad: Sell privately</h3>
                </div>

                <Separator />

                <ul className="space-y-4">
                  <FeatureItem
                    isIncluded={true}
                    text="Best sales price: You handle price negotiations yourself."
                  />
                  <FeatureItem
                    isIncluded={true}
                    text="Large reach: Your listing appears on Autovendo immediately."
                  />
                  <FeatureItem
                    isIncluded={true}
                    text="Over 2 million visits per month: Fast success possible."
                  />
                  <FeatureItem
                    isIncluded={false}
                    text="Takes more time: Handling test drives and scheduling viewings."
                  />
                </ul>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 text-sm font-medium"
                  >
                    ab CHF 69.-
                  </Badge>
                  <h3 className="text-xl font-bold">Ad: Sell privately</h3>
                </div>

                <Separator />

                <ul className="space-y-4">
                  <FeatureItem
                    isIncluded={true}
                    text="Best sales price: You handle price negotiations yourself."
                  />
                  <FeatureItem
                    isIncluded={true}
                    text="Large reach: Your listing appears on Autovendo immediately."
                  />
                  <FeatureItem
                    isIncluded={true}
                    text="Over 2 million visits per month: Fast success possible."
                  />
                  <FeatureItem
                    isIncluded={false}
                    text="Takes more time: Handling test drives and scheduling viewings."
                  />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-285 mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          We take care of the&nbsp;
          <span className="inline-block border-b-4 border-primary pb-1">
            details
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <ServiceDetail
            title="Sales price"
            description="We help you set the current market value of your vehicle."
            icon={Banknote}
          />

          <ServiceDetail
            title="Sales price"
            description="We help you set the current market value of your vehicle."
            icon={Banknote}
          />

          <ServiceDetail
            title="Sales price"
            description="We help you set the current market value of your vehicle."
            icon={Banknote}
          />

          <ServiceDetail
            title="Sales price"
            description="We help you set the current market value of your vehicle."
            icon={Banknote}
          />
        </div>
      </section>

      <section className="bg-secondary px-4 py-12">
        <div className="max-w-285 mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            High-quality photos&nbsp;
            <span className="inline-block border-b-4 border-primary pb-1">
              improve
            </span>
            &nbsp;your selling chances
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">
            <div className="w-full max-w-[300px]">
              <div className="aspect-square bg-white rounded-3xl p-8 shadow-xl flex items-center justify-center rotate-3">
                <Car className="size-32" strokeWidth={1} />
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-8">
              <PhotoTip
                number={1}
                title="Photograph in daylight"
                description="Ensure good lighting to showcase your car's true color and condition."
                icon={Sun}
              />
              <PhotoTip
                number={2}
                title="Choose a neutral location"
                description="Avoid busy backgrounds so the focus remains entirely on your vehicle."
                icon={MapPin}
              />
              <PhotoTip
                number={3}
                title="Shoot inside and out"
                description="Take detailed photos of the interior, exterior, and any special features or flaws."
                icon={Camera}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-285 mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">
          What fits&nbsp;
          <span className="inline-block border-b-4 border-primary pb-1">
            best
          </span>
          &nbsp;for you?
        </h2>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-12 text-left">
          <div className="flex flex-col gap-6">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold">
                Advertise and sell privately
              </h3>
              <p className="text-sm text-muted-foreground font-semibold uppercase">
                BEST POSSIBLE SALES PRICE
              </p>
            </div>
            <p className="text-muted-foreground">
              Advertising starting at CHF 69.-
            </p>
            <Button className="w-fit">Advertise now</Button>
          </div>

          <Separator orientation="vertical" className="hidden md:block" />

          <div className="flex flex-col gap-6">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold">
                Advertise and sell privately
              </h3>
              <p className="text-sm text-muted-foreground font-semibold uppercase">
                BEST POSSIBLE SALES PRICE
              </p>
            </div>
            <p className="text-muted-foreground">
              Advertising starting at CHF 69.-
            </p>
            <Button className="w-fit">Advertise now</Button>
          </div>
        </div>
      </section>
    </>
  );
}

function PhotoTip({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex gap-4">
      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-bold mt-1">
        {number}
      </div>
      <div>
        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
          <Icon className="size-5" />
          {title}
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ServiceDetail({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center">
      <Icon className="size-16 text-primary" strokeWidth={1} />
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureItem({
  isIncluded,
  text,
}: {
  isIncluded: boolean;
  text: string;
}) {
  return (
    <li className={`flex gap-3 ${!isIncluded ? "text-muted-foreground" : ""}`}>
      <div
        className={`${
          isIncluded ? "bg-green-100" : "bg-muted"
        } rounded-full p-1 size-6 flex items-center justify-center`}
      >
        {isIncluded ? (
          <Check className="size-4 text-green-700" strokeWidth={3} />
        ) : (
          <X className="size-4 text-muted-foreground" strokeWidth={3} />
        )}
      </div>
      <span className="text-sm md:text-base">{text}</span>
    </li>
  );
}
