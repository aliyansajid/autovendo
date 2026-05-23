"use client";

import { z } from "zod";
import { useForm, useWatch, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@repo/ui/lib/utils";
import { createVehicleFormSchema } from "@/schema/vehicle-form-schema";
import { SellerProfile } from "@/app/actions/seller.actions";
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
import { PricingSection } from "./form-sections/pricing-section";
import { ContactSection } from "./form-sections/contact-section";
import { EquipmentSection } from "./form-sections/equipment-section";
import { createListingCheckoutSession } from "@/app/actions/listings.actions";
import { useState, useTransition, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  formatPrice,
  formatKilometers,
  formatRegistrationDate,
} from "@/lib/helpers/format";
import {
  AlertCircleIcon,
  ArrowLeft,
  ArrowRight,
  Check,
  Send,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  prepareVehicleListing,
  getPresignedUrls,
  createVehicle,
  updateVehicle,
  type SubscriptionStatus,
} from "@/app/actions/vehicles.actions";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Spinner } from "@repo/ui/components/spinner";
import { getImageUrl } from "@/lib/helpers/image";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/alert";
import { Link } from "@/i18n/routing";

const VEHICLE_DATA_MAP: Record<string, any> = {
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
    "vehicleIdentificationNumber",
  ],
  2: ["images"],
  3: ["equipment", "extras"],
  4: ["companyName", "phoneNumber", "address", "zipCode", "city"],
  5: ["planId"],
  6: [],
};

export function VehicleForm({
  sellerProfile,
  initialData,
  vehicleId,
  subscriptionStatus,
}: {
  sellerProfile: SellerProfile | null;
  initialData?: z.infer<ReturnType<typeof createVehicleFormSchema>>;
  vehicleId?: string;
  subscriptionStatus?: SubscriptionStatus;
}) {
  const t = useTranslations("VehicleForm");
  const params = useParams();
  const locale = (params.locale as string) || "de";
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
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
      vehicleType: "car",
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
      companyName: initialData?.companyName || (sellerProfile ? `${sellerProfile.firstName} ${sellerProfile.lastName}` : ""),
      businessEmail: initialData?.businessEmail || sellerProfile?.email || "",
      phoneNumber: initialData?.phoneNumber || sellerProfile?.phoneNumber || "",
      address: initialData?.address || sellerProfile?.streetAddress || "",
      zipCode: initialData?.zipCode || sellerProfile?.zipCode || "",
      city: initialData?.city || sellerProfile?.city || "",
      status: (initialData?.status as any) || "DRAFT",
    },
  });

  const {
    control,
    handleSubmit,
    trigger,
    formState: { isDirty },
  } = form;

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
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
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
  const watchVIN = useWatch({ control, name: "vehicleIdentificationNumber" });

  const isStep1Complete = !!watchMake && !!watchPrice && !!watchKilometer && !!watchMonth && !!watchYear && !!watchBodyType && !!watchColor && !!watchVIN && watchVIN.length === 17;
  const isStep2Complete = watchImages && watchImages.length >= 5 && watchImages.length <= 10;
  const isStep5Complete = !!useWatch({ control, name: "planId" });

  const isNextDisabled =
    currentStep === 1 ? !isStep1Complete :
    currentStep === 2 ? !isStep2Complete :
    currentStep === 5 ? !isStep5Complete : false;

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const vehicleType = useWatch({ control, name: "vehicleType" });
  const vehicleData = VEHICLE_DATA_MAP[vehicleType] || VEHICLE_DATA_MAP.car;
  const activeMakes = vehicleData.makes;
  const activeModels = vehicleData.models || {};
  const activeBodyTypeEnum = vehicleData.bodyTypes;

  const uploadWithRetry = async (url: string, file: File, onProgress?: (p: number) => void, signal?: AbortSignal, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      if (signal?.aborted) throw new Error("Upload aborted");
      try {
        return await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", url);
          xhr.setRequestHeader("Content-Type", file.type);
          if (signal) signal.addEventListener("abort", () => { xhr.abort(); reject(new Error("Upload aborted")); });
          if (xhr.upload && onProgress) xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress((e.loaded / e.total) * 100); };
          xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) resolve(true); else reject(new Error("Failed")); };
          xhr.onerror = () => reject(new Error("Failed"));
          xhr.send(file);
        });
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, 1000 * 2**i));
      }
    }
    return false;
  };

  async function onSubmit(data: any) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    startTransition(async () => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      try {
        setUploadStatus(t("uploadStatusPreparing"));
        setUploadProgress(10);
        const { listingId } = await prepareVehicleListing(vehicleId);
        const images = data.images || [];
        const newFiles = images.filter((img: any) => img instanceof File);
        const existingKeys = images.filter((img: any) => typeof img === "string");
        let finalImageKeys = [...existingKeys];

        if (newFiles.length > 0) {
          setUploadStatus(t("uploadStatusGettingUrls"));
          const presignedData = await getPresignedUrls(listingId, newFiles.map((f: File) => ({ name: f.name, type: f.type })));
          setUploadStatus(t("uploadStatusUploading"));
          const uploadedKeys = await Promise.all(newFiles.map(async (file: File, idx: number) => {
            const prep = presignedData[idx];
            if (!prep) throw new Error("Upload preparation failed");
            const { url, key } = prep;
            await uploadWithRetry(url, file, (p) => { /* progress logic */ }, signal);
            return key;
          }));
          finalImageKeys = [...existingKeys, ...uploadedKeys];
        }

        setUploadStatus(t("uploadStatusSaving"));
        setUploadProgress(95);
        const { images: _, ...submitData } = data;
        
        if (vehicleId) {
          await updateVehicle(vehicleId, submitData, finalImageKeys);
          toast.success(t("successUpdate"));
        } else {
          const result = await createVehicle(listingId, submitData, finalImageKeys) as any;
          if (result && typeof result === "object" && "error" in result) throw new Error(result.error as string);
          
          if (!data.planId) throw new Error("No plan selected");
          setUploadStatus("Redirecting to payment...");
          const checkoutUrl = await createListingCheckoutSession(listingId, data.planId);
          window.location.href = checkoutUrl;
          return;
        }
        router.push("/dashboard/vehicles");
      } catch (error) {
        toast.error(t("errorGeneric"));
      } finally {
        setIsSubmitting(false);
      }
    });
  }

  const steps = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Photos" },
    { id: 3, label: "Equipment" },
    { id: 4, label: "Contact" },
    { id: 5, label: "Pricing" },
    { id: 6, label: "Summary" },
  ];

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
              <TechnicalDataSection />
            </div>
          )}
          {currentStep === 2 && <MediaSection previewImages={previewImages} setPreviewImages={setPreviewImages} />}
          {currentStep === 3 && <EquipmentSection />}
          {currentStep === 4 && <ContactSection />}
          {currentStep === 5 && <PricingSection />}
          {currentStep === 6 && (
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
              <Button type="submit" disabled={isSubmitting} onClick={() => form.setValue("status", "PUBLISHED")}>
                {isSubmitting ? <Spinner /> : <><Send className="mr-2" /> Pay & Publish</>}
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
