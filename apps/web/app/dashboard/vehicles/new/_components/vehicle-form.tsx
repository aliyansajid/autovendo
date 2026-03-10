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
import { EquipmentSection } from "./form-sections/equipment-section";
import {
  prepareVehicleListing,
  getPresignedUrls,
  createVehicle,
} from "@/app/actions/vehicle-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateVehicle } from "@/app/actions/vehicle-actions";

export function VehicleForm({
  dealerProfile,
  initialData,
  vehicleId,
}: {
  dealerProfile: DealerProfile | null;
  initialData?: z.infer<typeof vehicleFormSchema>;
  vehicleId?: string;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [previewImages, setPreviewImages] = useState<string[]>(
    (initialData?.images as string[]) || [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const totalSteps = 4;

  const form = useForm<z.infer<typeof vehicleFormSchema>>({
    resolver: zodResolver(vehicleFormSchema) as any,
    defaultValues: {
      vehicleType: "car",
      model: undefined,
      version: "",
      kilometer: "" as any,
      price: "" as any,
      newPrice: "" as any,
      registrationMonth: undefined,
      registrationYear: undefined,
      bodyType: undefined,
      fuelType: undefined,
      color: undefined,
      interiorColor: undefined,
      metallic: false,
      gearTransmission: undefined,
      transmissionType: undefined,
      driveType: undefined,
      vehicleCondition: undefined,
      lastInspectionDate: undefined,
      inspectionPassed: false,
      warranty: undefined,
      duration: "" as any,
      maxKm: "" as any,
      warrantyStartDate: undefined,
      doors: "" as any,
      seats: "" as any,
      hp: "" as any,
      kw: "" as any,
      energyLabel: undefined,
      typeApproval: "",
      wheelbase: "" as any,
      vehicleIdentificationNumber: "",
      emptyWeight: "" as any,
      loadCapacity: "" as any,
      serialNumber: "",
      height: "" as any,
      width: "" as any,
      length: "" as any,
      towingCapacityBraked: "" as any,
      cubicCapacity: "" as any,
      co2Emission: "" as any,
      cylinders: "" as any,
      numberOfGears: "" as any,
      range: "" as any,
      batteryCapacity: "" as any,
      batteryRentalMonth: "" as any,
      powerConsumption: "" as any,
      batteryOwnership: undefined,
      chargingPlugTypeStandard: undefined,
      chargingPlugTypeFast: undefined,
      chargingPower: "" as any,
      combustionEnginePowerHp: "" as any,
      electricMotorPowerHp: "" as any,
      emissionStandard: undefined,
      vehicleDescription: "",
      equipment: {},
      extras: {},
      ...(initialData || {}),
      // Ensure dealer info is always populated if not already present in initialData
      companyName: initialData?.companyName || dealerProfile?.companyName || "",
      businessEmail:
        initialData?.businessEmail || dealerProfile?.businessEmail || "",
      phoneNumber: initialData?.phoneNumber || dealerProfile?.phoneNumber || "",
      address: initialData?.address || dealerProfile?.address || "",
      zipCode: initialData?.zipCode || dealerProfile?.zipCode || "",
      city: initialData?.city || dealerProfile?.city || "",
    },
  });

  const { control, handleSubmit, trigger } = form;

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

  const uploadWithRetry = async (
    url: string,
    file: File,
    retries = 3,
  ): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[Upload] Attempt ${i + 1} to: ${url}`);
        const response = await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (response.ok) {
          console.log(`[Upload] Success: ${file.name}`);
          return true;
        }

        const errorText = await response.text();
        console.error(
          `[Upload] Server rejected upload (${response.status}):`,
          errorText,
        );
      } catch (error) {
        console.error(
          `[Upload] Fetch failed for ${file.name} (Attempt ${i + 1}):`,
          error,
        );
        if (i === retries - 1) throw error;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
    return false;
  };

  const onSubmit = async (data: z.infer<typeof vehicleFormSchema>) => {
    try {
      setIsSubmitting(true);
      setUploadStatus("Listing vorbereiten...");
      setUploadProgress(10);

      // Phase 0: Prepare
      const { listingId } = await prepareVehicleListing();

      // Phase 1: Separate new files and existing keys
      const images = data.images || [];
      const newFiles = images.filter((img) => img instanceof File) as File[];
      const existingKeys = images.filter(
        (img) => typeof img === "string",
      ) as string[];

      let finalImageKeys = [...existingKeys];

      if (newFiles.length > 0) {
        setUploadStatus("Upload-Berechtigungen abrufen...");
        const presignedData = await getPresignedUrls(
          listingId,
          newFiles.map((f) => ({ name: f.name, type: f.type })),
        );

        // Phase 2: Upload Files
        setUploadStatus("Bilder hochladen...");
        const newlyUploadedKeys: string[] = [];

        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i]!;
          const presignedItem = presignedData[i];

          if (!presignedItem) {
            throw new Error(`Konnte keine Upload-URL für ${file.name} abrufen`);
          }

          const { url, key } = presignedItem;

          const success = await uploadWithRetry(url, file);
          if (!success)
            throw new Error(`Upload fehlgeschlagen für ${file.name}`);

          newlyUploadedKeys.push(key);
          setUploadProgress(20 + ((i + 1) / newFiles.length) * 60);
        }

        finalImageKeys = [...existingKeys, ...newlyUploadedKeys];
      }

      // Phase 3: Create or Update Vehicle in DB
      setUploadStatus("Daten speichern...");

      // Remove images from data to avoid exceeding 1MB Server Action limit
      const { images: _, ...submitData } = data;
      if (vehicleId) {
        await updateVehicle(vehicleId, submitData, finalImageKeys);
        toast.success("Inserat erfolgreich aktualisiert!");
      } else {
        await createVehicle(listingId, submitData, finalImageKeys);
        toast.success("Inserat erfolgreich erstellt!");
      }

      setUploadProgress(100);
      toast.success("Inserat erfolgreich veröffentlicht!");
      router.push("/dashboard/vehicles");
      router.refresh();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Fehler beim Veröffentlichen",
      );
      setUploadStatus("");
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
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
                            src={
                              src.startsWith("blob:") || src.startsWith("http")
                                ? src
                                : `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || ""}/${src}`
                            }
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
              <Button
                key="next-button"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
              >
                Weiter
                <ArrowRight />
              </Button>
            ) : (
              <Button
                key="submit-button"
                type="submit"
                disabled={isSubmitting}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verarbeiten...
                  </>
                ) : (
                  <>
                    Inserat veröffentlichen
                    <Send />
                  </>
                )}
              </Button>
            )}
          </div>

          {isSubmitting && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card border p-8 rounded-xl shadow-lg max-w-md w-full space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>{uploadStatus}</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Bitte schließe dieses Fenster nicht, bis der Vorgang
                  abgeschlossen ist.
                </p>
              </div>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
}
