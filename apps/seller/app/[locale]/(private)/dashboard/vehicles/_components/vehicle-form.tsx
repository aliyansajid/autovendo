/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { z } from "zod";
import { useForm, useWatch, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@repo/ui/lib/utils";
import { createVehicleFormSchema } from "@/schema/vehicle-form-schema";
import {
  apiUploadImagesWithProgress,
  apiCreateVehicle,
  apiUpdateVehicle,
  apiCreateListingCheckout,
} from "@/lib/api/seller-vehicles";
import type { SellerProfile } from "@/lib/api/vehicles";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { BasicDataSection } from "./form-sections/basic-data-section";
import { TechnicalDataSection } from "./form-sections/technical-data-section";
import { MediaSection } from "./form-sections/media-section";
import { PricingSection } from "./form-sections/pricing-section";
import { ContactSection } from "./form-sections/contact-section";
import { EquipmentSection } from "./form-sections/equipment-section";
import { useState, useTransition, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Spinner } from "@repo/ui/components/spinner";

const STEP_FIELDS: Record<number, any[]> = {
  1: [
    "vehicleType",
    "make",
    "model",
    "version",
    "price",
    "kilometer",
    "registrationMonth",
    "registrationYear",
    "bodyType",
    "fuelType",
    "color",
    "vehicleCondition",
  ],
  2: ["images"],
  3: ["companyName", "phoneNumber", "address", "zipCode", "city"],
  4: ["planId"],
  5: [],
};

export function VehicleForm({
  sellerProfile,
  initialData,
  vehicleId,
  isPaid,
  listingPlan,
}: {
  sellerProfile: SellerProfile | null;
  initialData?: z.infer<ReturnType<typeof createVehicleFormSchema>>;
  vehicleId?: string;
  isPaid?: boolean;
  listingPlan?: "standard" | "best_value";
}) {
  const t = useTranslations("VehicleForm");
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "de";

  const [, startTransition] = useTransition(); // used only to defer the async work off the main thread
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const [previewImages, setPreviewImages] = useState<string[]>(
    (initialData?.images as string[]) || [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const tSchema = useTranslations("VehicleSchema");
  const schema = createVehicleFormSchema(tSchema);

  const form = useForm<z.infer<ReturnType<typeof createVehicleFormSchema>>>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      vehicleType: "CAR",
      model: undefined,
      version: "",
      kilometer: "" as any,
      price: "" as any,
      newPrice: "" as any,
      registrationMonth: "" as any,
      registrationYear: "" as any,
      bodyType: "" as any,
      fuelType: "" as any,
      color: "" as any,
      interiorColor: "" as any,
      metallic: false,
      gearTransmission: "",
      transmissionType: "",
      driveType: "",
      vehicleCondition: "",
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
      vin: "",
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
      companyName: initialData?.companyName || sellerProfile?.user?.name || "",
      businessEmail: initialData?.businessEmail || sellerProfile?.user?.email || "",
      phoneNumber: initialData?.phoneNumber || sellerProfile?.phoneNumber || "",
      address: initialData?.address || sellerProfile?.streetAddress || "",
      zipCode: initialData?.zipCode || sellerProfile?.zipCode || "",
      city: initialData?.city || sellerProfile?.city || "",
      status: (initialData?.status as any) || "DRAFT",
    },
  });

  const { control, handleSubmit, trigger } = form;

  const watchMake = useWatch({ control, name: "make" });

  useEffect(() => {
    if (vehicleId && watchMake && initialData?.make && watchMake !== initialData.make) {
      form.setValue("model", "" as any, { shouldDirty: true });
    }
  }, [watchMake, vehicleId, initialData?.make, form]);

  const fuelType = useWatch({ control, name: "fuelType" });
  const prevFuelTypeRef = useRef<string | undefined>(initialData?.fuelType);

  useEffect(() => {
    if (fuelType && prevFuelTypeRef.current && fuelType !== prevFuelTypeRef.current) {
      // Logic to clear irrelevant fields
    }
    prevFuelTypeRef.current = fuelType;
  }, [fuelType, form]);

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep] || [];
    const isStepValid = await trigger(fields as any[]);
    if (isStepValid) {
      // Skip plan step (4) when vehicle is already paid
      const next = isPaid && currentStep === 3 ? 5 : currentStep + 1;
      setCurrentStep(Math.min(next, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const watchPrice = useWatch({ control, name: "price" });
  const watchKilometer = useWatch({ control, name: "kilometer" });
  const watchMonth = useWatch({ control, name: "registrationMonth" });
  const watchYear = useWatch({ control, name: "registrationYear" });
  const watchBodyType = useWatch({ control, name: "bodyType" });
  const watchColor = useWatch({ control, name: "color" });
  const watchImages = useWatch({ control, name: "images" });
  const isStep1Complete = !!watchMake && !!watchPrice && !!watchKilometer && !!watchMonth && !!watchYear && !!watchBodyType && !!watchColor;
  const isStep2Complete = watchImages && watchImages.length >= 5 && watchImages.length <= 25;
  const isStep4Complete = !!useWatch({ control, name: "planId" });

  const isNextDisabled =
    currentStep === 1 ? !isStep1Complete :
    currentStep === 2 ? !isStep2Complete :
    currentStep === 4 ? (!isPaid && !isStep4Complete) : false;

  const handleBack = () => {
    // Skip plan step (4) when vehicle is already paid
    const prev = isPaid && currentStep === 5 ? 3 : currentStep - 1;
    setCurrentStep(Math.max(prev, 1));
    window.scrollTo(0, 0);
  };




  async function onSubmit(data: any) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    startTransition(async () => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      try {
        setUploadStatus(t("uploadStatusPreparing"));
        setUploadProgress(0);
        const images = data.images || [];
        const newFiles = images.filter((img: any) => img instanceof File);
        const existingKeys = images.filter((img: any) => typeof img === "string");
        let finalImageKeys = [...existingKeys];

        if (newFiles.length > 0) {
          setUploadStatus(t("uploadStatusUploading"));
          setUploadProgress(10);
          const uploadedKeys = await apiUploadImagesWithProgress(
            newFiles,
            (pct) => setUploadProgress(10 + pct * 0.75), // maps 0–100% upload → 10–85% bar
            signal,
          );
          finalImageKeys = [...existingKeys, ...uploadedKeys];
        }

        setUploadStatus(t("uploadStatusSaving"));
        setUploadProgress(85);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { images: _images, ...submitData } = data;

        if (vehicleId) {
          if (isPaid) {
            // Already paid — update and stay published
            await apiUpdateVehicle(vehicleId, submitData, finalImageKeys);
            toast.success(t("successUpdate"));
          } else {
            // Not paid — save as draft, then redirect to Stripe
            await apiUpdateVehicle(vehicleId, { ...submitData, status: "DRAFT" }, finalImageKeys);
            const planId = data.planId || listingPlan;
            if (!planId) throw new Error(t("errorNoPlan"));
            setUploadStatus(t("uploadStatusRedirecting"));
            setUploadProgress(95);
            const checkoutUrl = await apiCreateListingCheckout(vehicleId, planId as "standard" | "best_value", locale);
            setUploadProgress(100);
            window.location.href = checkoutUrl;
            return;
          }
        } else {
          const result = await apiCreateVehicle(submitData, finalImageKeys) as any;
          if (result && typeof result === "object" && "error" in result) throw new Error(result.error as string);

          const createdVehicleId = result?.data?.id ?? result?.id;
          if (!createdVehicleId) throw new Error(t("errorGeneric"));
          if (!data.planId) throw new Error(t("errorNoPlan"));
          setUploadStatus(t("uploadStatusRedirecting"));
          setUploadProgress(95);
          const checkoutUrl = await apiCreateListingCheckout(createdVehicleId, data.planId, locale);
          setUploadProgress(100);
          window.location.href = checkoutUrl;
          return;
        }
        router.push("/dashboard/vehicles");
      } catch (error) {
        console.error("[VehicleForm] submit error:", error);
        toast.error(t("errorGeneric"));
      } finally {
        setIsSubmitting(false);
      }
    });
  }

  const allSteps = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Photos" },
    { id: 3, label: "Contact" },
    { id: 4, label: "Plan" },
    { id: 5, label: "Summary" },
  ];
  const steps = isPaid ? allSteps.filter((s) => s.id !== 4) : allSteps;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start w-full max-w-3xl mx-auto mb-8 isolate">
        {steps.map((step, index) => (
          <div key={step.id} className="contents">
            <div className="flex flex-col items-center gap-2 z-10 w-32">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold bg-background",
                currentStep >= step.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                currentStep === step.id && "ring-4 ring-primary/20"
              )}>
                {currentStep > step.id ? <Check /> : step.id}
              </div>
              <span className={cn("text-xs font-medium", currentStep >= step.id ? "text-primary" : "text-muted-foreground")}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <Separator className={cn("flex-1 mt-5 -translate-y-1/2", currentStep > step.id ? "bg-primary" : "")} />
            )}
          </div>
        ))}
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <BasicDataSection />
              <Separator />
              <EquipmentSection />
              <Separator />
              <TechnicalDataSection isEdit={!!vehicleId} />
            </div>
          )}
          {currentStep === 2 && <MediaSection previewImages={previewImages} setPreviewImages={setPreviewImages} />}
          {currentStep === 3 && <ContactSection />}
          {currentStep === 4 && <PricingSection />}
          {currentStep === 5 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Review & Publish</CardTitle>
                <Button variant="ghost" type="button" onClick={() => setCurrentStep(1)}>Edit</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p className="font-bold">{form.getValues("make")} {form.getValues("model")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-bold">CHF {form.getValues("price")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-bold">{form.getValues("phoneNumber")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-bold capitalize">{form.getValues("planId")?.replace("_", " ")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-8 border-t">
            <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1} className={cn(currentStep === 1 && "invisible")}>
              <ArrowLeft /> Back
            </Button>
            {currentStep < totalSteps ? (
              <Button type="button" disabled={isNextDisabled} onClick={handleNext}>
                Next <ArrowRight />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : <><Send className="mr-2" /> Publish</>}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>

      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <Spinner className="mx-auto" />
              <p className="font-bold">{uploadStatus}</p>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
