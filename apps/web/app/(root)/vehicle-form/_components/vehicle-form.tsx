"use client";

import { z } from "zod";
import { useForm, useWatch, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { GearTransmissionEnum } from "@/constants";
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
import { vehicleFormSchema } from "@/schema/vehicle-form-schema";
import { BasicDataSection } from "./form-sections/basic-data-section";
import { EquipmentSection } from "./form-sections/equipment-section";
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

export function VehicleForm() {
  const form = useForm<z.infer<typeof vehicleFormSchema>>({
    resolver: zodResolver(vehicleFormSchema) as any,
    defaultValues: {
      vehicleType: "car",
      make: "",
      model: "",
      version: "",
      kilometer: "" as any,
      priceChf: "" as any,
      newPriceChf: "" as any,
      doors: "" as any,
      seats: "" as any,
      hp: "" as any,
      kw: "" as any,
      consumptionCity: "" as any,
      consumptionCountry: "" as any,
      consumptionTotal: "" as any,
      cubicCapacity: "" as any,
      co2Emission: "" as any,
      cylinders: "" as any,
      numberOfGears: "" as any,
      emptyWeight: "" as any,
      loadCapacity: "" as any,
      towingCapacityBraked: "" as any,
      range: "" as any,
      batteryCapacity: "" as any,
      powerConsumption: "" as any,
      chargingPower: "" as any,
      billingFirstName: "",
      billingLastName: "",
      billingStreet: "",
      billingZip: "",
      billingCity: "",
      billingPhone: "",
      ownerFirstName: "",
      ownerLastName: "",
      ownerStreet: "",
      ownerZip: "",
      ownerCity: "",
      ownerPhone: "",
    },
  });

  const { control, handleSubmit, trigger } = form;

  const [currentStep, setCurrentStep] = useState(1);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const totalSteps = 4;

  const handleNext = async () => {
    let isStepValid = false;

    if (currentStep === 1) {
      isStepValid = await trigger([
        "make",
        "model",
        "gearTransmission",
        "fuelType",
        "bodyType",
        "color",
        "interiorColor",
        "vehicleCondition",
        "kilometer",
        "priceChf",
        "registrationMonth",
        "registrationYear",
      ]);
    } else if (currentStep === 2) {
      isStepValid = true;
    } else if (currentStep === 3) {
      isStepValid = await trigger([
        "billingFirstName",
        "billingLastName",
        "billingStreet",
        "billingZip",
        "billingCity",
        "billingCountry",
        "billingPhone",
        "sameAsBilling",
        "ownerFirstName",
        "ownerLastName",
        "ownerStreet",
        "ownerZip",
        "ownerCity",
        "ownerCountry",
        "ownerPhone",
      ]);
    }

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
  const isCommercial = vehicleType === "utility";
  const isTruck = vehicleType === "truck";
  const isCamper = vehicleType === "camper";

  const activeMakes = (
    isTruck
      ? truckMakes
      : isCamper
        ? camperMakes
        : isCommercial
          ? utilityMakes
          : carMakes
  ) as ReadonlyArray<{
    label: string;
    items: ReadonlyArray<{ value: string; label: string }>;
  }>;
  const activeModels: Record<string, { value: string; label: string }[]> =
    isTruck ? truckModels : isCommercial ? utilityModels : carModels;

  const activeBodyTypeEnum = isTruck
    ? truckBodyTypeEnum
    : isCamper
      ? camperBodyTypeEnum
      : isCommercial
        ? utilityBodyTypeEnum
        : carBodyTypeEnum;

  const activeFuelTypeEnum = isTruck
    ? truckFuelTypeEnum
    : isCamper
      ? camperFuelTypeEnum
      : carFuelTypeEnum;

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
    { id: 1, label: "Vehicle Details" },
    { id: 2, label: "Photos" },
    { id: 3, label: "Contact Details" },
    { id: 4, label: "Review" },
  ];

  const getLabel = (
    value: string | undefined,
    options: readonly { value: string; label: string }[],
  ) => {
    if (!value) return "-";
    return options.find((o) => o.value === value)?.label || value;
  };

  return (
    <>
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-w-3xl mx-auto"
        >
          {currentStep === 1 && (
            <div className="space-y-6">
              <BasicDataSection />
              <Separator />
              <EquipmentSection />
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
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Overblick</CardTitle>
                    <Button variant="link" onClick={() => setCurrentStep(1)}>
                      Bearbeiten
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Marke</div>
                    <div className="font-medium">
                      {
                        activeMakes
                          .flatMap(
                            (g: {
                              label: string;
                              items: ReadonlyArray<{
                                value: string;
                                label: string;
                              }>;
                            }) => [...g.items],
                          )
                          .find(
                            (m: { value: string; label: string }) =>
                              m.value === form.getValues("make"),
                          )?.label
                      }
                    </div>

                    <div className="text-muted-foreground">Modell</div>
                    <div className="font-medium">
                      {activeModels[form.getValues("make")]?.find(
                        (m: any) => m.value === form.getValues("model"),
                      )?.label || form.getValues("model")}
                    </div>

                    <div className="text-muted-foreground">Version</div>
                    <div className="font-medium">
                      {form.getValues("version") || "-"}
                    </div>

                    <div className="text-muted-foreground">Karosserie</div>
                    <div className="font-medium">
                      {getLabel(form.getValues("bodyType"), activeBodyTypeEnum)}
                    </div>

                    <div className="text-muted-foreground">Kraftstoff</div>
                    <div className="font-medium">
                      {getLabel(form.getValues("fuelType"), activeFuelTypeEnum)}
                    </div>

                    <div className="text-muted-foreground">Getriebe</div>
                    <div className="font-medium">
                      {getLabel(
                        form.getValues("gearTransmission"),
                        GearTransmissionEnum,
                      )}
                    </div>

                    <div className="text-muted-foreground">Kilometerstand</div>
                    <div className="font-medium">
                      {form.getValues("kilometer")}
                    </div>

                    <div className="text-muted-foreground">Jahrgang</div>
                    <div className="font-medium">
                      {form.getValues("registrationMonth")}/
                      {form.getValues("registrationYear")}
                    </div>

                    <div className="text-muted-foreground">Preis</div>
                    <div className="font-medium">
                      CHF {form.getValues("priceChf")}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Fotos</CardTitle>
                    <Button variant="link" onClick={() => setCurrentStep(2)}>
                      Bearbeiten
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {previewImages.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {previewImages.map((src, index) => (
                        <div
                          key={index}
                          className="relative aspect-video rounded-md overflow-hidden border bg-muted"
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
                    <div className="text-muted-foreground text-sm">
                      Keine Fotos hochgeladen
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Kontakt</CardTitle>
                    <Button variant="link" onClick={() => setCurrentStep(3)}>
                      Bearbeiten
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Rechnungsadresse</h4>
                    <div className="text-sm text-muted-foreground">
                      {form.getValues("billingFirstName")}{" "}
                      {form.getValues("billingLastName")}
                      <br />
                      {form.getValues("billingStreet")}
                      <br />
                      {form.getValues("billingZip")}{" "}
                      {form.getValues("billingCity")}
                      <br />
                      {form.getValues("billingCountry")}
                      <br />
                      {form.getValues("billingPhone")}
                    </div>
                  </div>

                  {!form.getValues("sameAsBilling") && (
                    <div>
                      <h4 className="font-semibold mb-2">Halter</h4>
                      <div className="text-sm text-muted-foreground">
                        {form.getValues("ownerFirstName")}{" "}
                        {form.getValues("ownerLastName")}
                        <br />
                        {form.getValues("ownerStreet")}
                        <br />
                        {form.getValues("ownerZip")}{" "}
                        {form.getValues("ownerCity")}
                        <br />
                        {form.getValues("ownerCountry")}
                        <br />
                        {form.getValues("ownerPhone")}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-between">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft />
                Back
              </Button>
            )}
            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext} className="ml-auto">
                Next
                <ArrowRight />
              </Button>
            ) : (
              <Button type="submit" className="ml-auto">
                Submit
                <Send />
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </>
  );
}
