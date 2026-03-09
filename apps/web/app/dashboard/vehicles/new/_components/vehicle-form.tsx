"use client";

import { z } from "zod";
import { useForm, useWatch, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@repo/ui/lib/utils";
import { vehicleFormSchema } from "@/schema/vehicle-form-schema";
import { DealerProfile } from "@/types";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import {
  carMakes,
  carModels,
  carBodyTypeEnum,
  carFuelTypeEnum,
} from "@/constants/cars";
import {
  utilityMakes,
  utilityModels,
  utilityBodyTypeEnum,
  utilityFuelTypeEnum,
} from "@/constants/commercial-vehicles";
import {
  truckMakes,
  truckModels,
  truckBodyTypeEnum,
  truckFuelTypeEnum,
} from "@/constants/truck";
import {
  camperMakes,
  camperBodyTypeEnum,
  camperFuelTypeEnum,
} from "@/constants/camper";
import { BasicDataSection } from "./form-sections/basic-data-section";
import { TechnicalDataSection } from "./form-sections/technical-data-section";
import { MediaSection } from "./form-sections/media-section";
import { ContactSection } from "./form-sections/contact-section";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";

const MANDATORY_FIELD_GROUPS: Record<
  number,
  (keyof z.infer<typeof vehicleFormSchema>)[]
> = {
  1: [
    "vehicleType",
    "make",
    "bodyType",
    "color",
    "registrationMonth",
    "registrationYear",
    "kilometer",
    "price",
  ],
  2: [],
  3: [],
};

export function VehicleForm({
  dealerProfile,
}: {
  dealerProfile: DealerProfile | null;
}) {
  const form = useForm<z.infer<typeof vehicleFormSchema>>({
    resolver: zodResolver(vehicleFormSchema) as any,
    defaultValues: {
      vehicleType: "car",
      version: "",
      kilometer: "" as any,
      price: "" as any,
      newPrice: "" as any,
      doors: "" as any,
      seats: "" as any,
      hp: "" as any,
      kw: "" as any,
      typeApproval: "",
      wheelbase: "" as any,
      vehicleIdentificationNumber: "",
      serialNumber: "",
      height: "" as any,
      width: "" as any,
      length: "" as any,
      emptyWeight: "" as any,
      loadCapacity: "" as any,
      towingCapacityBraked: "" as any,
      consumptionCity: "" as any,
      consumptionCountry: "" as any,
      consumptionTotal: "" as any,
      cubicCapacity: "" as any,
      co2Emission: "" as any,
      cylinders: "" as any,
      numberOfGears: "" as any,
      range: "" as any,
      batteryCapacity: "" as any,
      batteryRentalMonth: "" as any,
      powerConsumption: "" as any,
      chargingPower: "" as any,
      chargingTime80: "" as any,
      fastChargingTime80: "" as any,
      chargingTime100: "" as any,
      fastChargingTime100: "" as any,
      combustionEnginePowerHp: "" as any,
      electricMotorPowerHp: "" as any,
      vehicleDescription: "",
      // Dealer info
      companyName: dealerProfile?.companyName || "",
      businessEmail: dealerProfile?.businessEmail || "",
      phoneNumber: dealerProfile?.phoneNumber || "",
      address: dealerProfile?.address || "",
      zipCode: dealerProfile?.zipCode || "",
      city: dealerProfile?.city || "",
    },
  });

  const { control, handleSubmit, trigger } = form;

  const [currentStep, setCurrentStep] = useState(1);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const totalSteps = 4;

  const handleNext = async () => {
    const isStepValid = await trigger();

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const vehicleType = useWatch({ control, name: "vehicleType" });

  const vehicleDataMap: Record<string, any> = {
    car: {
      makes: carMakes,
      models: carModels,
      bodyTypes: carBodyTypeEnum,
      fuelTypes: carFuelTypeEnum,
    },
    utility: {
      makes: utilityMakes,
      models: utilityModels,
      bodyTypes: utilityBodyTypeEnum,
      fuelTypes: utilityFuelTypeEnum,
    },
    truck: {
      makes: truckMakes,
      models: truckModels,
      bodyTypes: truckBodyTypeEnum,
      fuelTypes: truckFuelTypeEnum,
    },
    camper: {
      makes: camperMakes,
      models: {},
      bodyTypes: camperBodyTypeEnum,
      fuelTypes: camperFuelTypeEnum,
    },
  };

  const vehicleData = vehicleDataMap[vehicleType] || vehicleDataMap.car;

  const activeMakes = vehicleData.makes as ReadonlyArray<{
    label: string;
    items: ReadonlyArray<{ value: string; label: string }>;
  }>;
  const activeModels: Record<string, { value: string; label: string }[]> =
    vehicleData.models as any;
  const activeBodyTypeEnum = vehicleData.bodyTypes;

  const onSubmit = (data: z.infer<typeof vehicleFormSchema>) => {
    console.log("Form Submitted:", data);
    alert(
      JSON.stringify(
        { ...data, images: `${(data.images as any[])?.length || 0} files` },
        null,
        2,
      ),
    );
  };

  const steps = [
    { id: 1, label: "Fahrzeugdaten" },
    { id: 2, label: "Fotos" },
    { id: 3, label: "Kontaktdaten" },
    { id: 4, label: "Vorschau" },
  ];

  const getLabel = (
    value: string | undefined,
    options: readonly { value: string; label: string }[],
  ) => {
    if (!value) return "-";
    return options.find((o) => o.value === value)?.label || value;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start w-full max-w-3xl mx-auto mb-8 isolate">
        {steps.map((step, index) => {
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="contents">
              <div className="flex flex-col items-center gap-2 z-10 w-32">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold bg-background",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/20",
                  )}
                >
                  {isCompleted ? <Check /> : step.id}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <Separator
                  className={cn(
                    "flex-1 transition-colors duration-500 mt-5 -translate-y-1/2",
                    currentStep > step.id ? "bg-primary" : "",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <BasicDataSection />
              <Separator />
              <TechnicalDataSection />
            </div>
          )}

          {currentStep === 2 && (
            <MediaSection
              previewImages={previewImages}
              setPreviewImages={setPreviewImages}
            />
          )}

          {currentStep === 3 && <ContactSection />}

          {currentStep === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>Zusammenfassung</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="text-primary"
                  >
                    Bearbeiten
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Marke & Modell</p>
                      <p className="font-bold text-base">
                        {
                          activeMakes
                            .flatMap((g) => g.items)
                            .find((m) => m.value === form.getValues("make"))
                            ?.label
                        }{" "}
                        {activeModels[form.getValues("make")]?.find(
                          (m: any) => m.value === form.getValues("model"),
                        )?.label || form.getValues("model")}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-muted-foreground">Version</p>
                      <p className="font-bold text-base">
                        {form.getValues("version") || "-"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-muted-foreground">Preis</p>
                      <p className="font-bold text-base">
                        CHF {form.getValues("price")}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-muted-foreground">Kilometerstand</p>
                      <p className="font-bold text-base">
                        {form.getValues("kilometer")} km
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-muted-foreground">Erstzulassung</p>
                      <p className="font-bold text-base">
                        {form.getValues("registrationMonth")} /{" "}
                        {form.getValues("registrationYear")}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-muted-foreground">Karosserie</p>
                      <p className="font-bold text-base">
                        {getLabel(
                          form.getValues("bodyType"),
                          activeBodyTypeEnum,
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>Fotos</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="text-primary"
                  >
                    Bearbeiten
                  </Button>
                </CardHeader>
                <CardContent>
                  {previewImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {previewImages.map((src, index) => (
                        <div
                          key={index}
                          className="relative aspect-video rounded-lg overflow-hidden border shadow-sm"
                        >
                          <Image
                            src={src}
                            alt={`Review ${index}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
                      <p className="text-muted-foreground">
                        Keine Fotos hochgeladen
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>Unternehmensdaten</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    className="text-primary"
                  >
                    Bearbeiten
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground mb-2">
                        Firma & Adresse
                      </p>
                      <p className="font-bold text-base">
                        {form.getValues("companyName") || "Privatperson"}
                      </p>
                      <p className="text-muted-foreground">
                        {form.getValues("address") || "-"}
                      </p>
                      <p className="text-muted-foreground">
                        {form.getValues("zipCode")} {form.getValues("city")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground mb-2">Kontakt</p>
                      <p className="font-bold text-base">
                        {form.getValues("phoneNumber") || "-"}
                      </p>
                      <p className="text-muted-foreground">
                        {form.getValues("businessEmail") || "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-between pt-8 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(currentStep === 1 && "invisible")}
            >
              <ArrowLeft />
              Zurück
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext}>
                Weiter
                <ArrowRight />
              </Button>
            ) : (
              <Button type="submit">
                Inserat veröffentlichen
                <Send />
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
