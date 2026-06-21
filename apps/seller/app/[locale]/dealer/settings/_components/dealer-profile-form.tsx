"use client";

import { z } from "zod";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDealerProfileSchema } from "@/schema/profile-schema";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { FieldGroup } from "@repo/ui/components/field";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { useTranslations } from "next-intl";
import { useTransition, useEffect, useState, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { updateDealerProfile } from "@/lib/api/dealers";
import { Spinner } from "@repo/ui/components/spinner";
import { DealerProfile } from "@/types/dealer";
import { swissCities } from "@repo/vehicle-constants";
import { SelectItem } from "@repo/ui/components/select";

type DealerProfileFormValues = z.infer<
  ReturnType<typeof createDealerProfileSchema>
>;

function useObjectUrl(value: File | string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(
    typeof value === "string" && value ? value : null,
  );

  useEffect(() => {
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof value === "string" && value) {
      setUrl(value);
    } else {
      setUrl(null);
    }
  }, [value]);

  return url;
}

function OpeningHourRow({
  control,
  index,
  dayLabel,
  openLabel,
  closedLabel,
  isPending,
}: {
  control: Control<DealerProfileFormValues>;
  index: number;
  dayLabel: string;
  openLabel: string;
  closedLabel: string;
  isPending: boolean;
}) {
  const isOpen = useWatch({
    control,
    name: `openingHours.${index}.isOpen`,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 p-3 rounded-lg border bg-muted/30">
      <span className="font-medium">{dayLabel}</span>
      <div className="flex items-center gap-2">
        <CustomFormField
          control={control}
          fieldType={FormFieldType.CHECKBOX}
          name={`openingHours.${index}.isOpen`}
          label={isOpen ? openLabel : closedLabel}
          disabled={isPending}
        />
      </div>
      {isOpen && (
        <>
          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT}
            inputType="time"
            name={`openingHours.${index}.openTime`}
            placeholder="08:00"
            disabled={isPending}
          />
          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT}
            inputType="time"
            name={`openingHours.${index}.closeTime`}
            placeholder="18:00"
            disabled={isPending}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ImagePreview — isolated to avoid re-rendering the whole form
// ---------------------------------------------------------------------------

function ImagePreview({
  src,
  alt,
  aspectClass,
  onRemove,
}: {
  src: string;
  alt: string;
  aspectClass: string;
  onRemove: () => void;
}) {
  return (
    <div
      className={`relative ${aspectClass} rounded-lg overflow-hidden border`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="object-cover w-full h-full" />
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
        onClick={onRemove}
      >
        ✕
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DealerProfileForm
// ---------------------------------------------------------------------------

interface DealerProfileFormProps {
  initialData: DealerProfile | null;
}

export const DealerProfileForm = ({ initialData }: DealerProfileFormProps) => {
  const t = useTranslations("DealerProfileForm");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const tSchema = useTranslations("ProfileSchema");

  const schema = useMemo(() => createDealerProfileSchema(tSchema), [tSchema]);

  const form = useForm<DealerProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.user?.name || "",
      email: initialData?.user?.email || "",
      image: initialData?.user?.image || undefined,
      companyName: initialData?.companyName || "",
      description: initialData?.description || "",
      website: initialData?.website || "",
      logo: initialData?.logo || undefined,
      coverImage: initialData?.coverImage || undefined,
      streetAddress: initialData?.streetAddress || "",
      country: "Switzerland" as const,
      zipCode: initialData?.zipCode || "",
      city: initialData?.city || "",
      uidNumber: initialData?.uidNumber || "",
      contactPerson: initialData?.contactPerson || "",
      phoneNumber: initialData?.phoneNumber || "",
      businessEmail: initialData?.businessEmail || "",
      openingHours: initialData?.openingHours?.length
        ? initialData.openingHours.map((oh) => ({
            day: oh.day,
            isOpen: oh.isOpen,
            openTime: oh.openTime || "08:00",
            closeTime: oh.closeTime || "18:00",
          }))
        : [
            {
              day: "MONDAY",
              isOpen: true,
              openTime: "08:00",
              closeTime: "18:00",
            },
            {
              day: "TUESDAY",
              isOpen: true,
              openTime: "08:00",
              closeTime: "18:00",
            },
            {
              day: "WEDNESDAY",
              isOpen: true,
              openTime: "08:00",
              closeTime: "18:00",
            },
            {
              day: "THURSDAY",
              isOpen: true,
              openTime: "08:00",
              closeTime: "18:00",
            },
            {
              day: "FRIDAY",
              isOpen: true,
              openTime: "08:00",
              closeTime: "18:00",
            },
            {
              day: "SATURDAY",
              isOpen: false,
              openTime: "08:00",
              closeTime: "18:00",
            },
            {
              day: "SUNDAY",
              isOpen: false,
              openTime: "08:00",
              closeTime: "18:00",
            },
          ],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "openingHours",
  });

  // If dealer has no saved opening hours, mark form dirty so they can save defaults
  useEffect(() => {
    if (!initialData?.openingHours?.length) {
      form.setValue("openingHours", form.getValues("openingHours"), {
        shouldDirty: true,
      });
    }
    // form and initialData are stable refs — adding them would cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useWatch for image fields — each only triggers its own re-render
  const imageValue = useWatch({ control: form.control, name: "image" });
  const logoValue = useWatch({ control: form.control, name: "logo" });
  const coverValue = useWatch({ control: form.control, name: "coverImage" });

  // Object URL lifecycle management — no memory leaks
  const imagePreviewUrl = useObjectUrl(imageValue as File | string | undefined);
  const logoPreviewUrl = useObjectUrl(logoValue as File | string | undefined);
  const coverPreviewUrl = useObjectUrl(coverValue as File | string | undefined);

  function onSubmit(values: DealerProfileFormValues) {
    startTransition(async () => {
      try {
        const emailChanged = values.email !== initialData?.user?.email;

        // One multipart call — the API uploads any new images to R2, writes the
        // Dealer + User rows, and proxies the email change to Better Auth.
        const result = await updateDealerProfile({
          name: values.name,
          email: values.email,
          avatar: values.image,
          companyName: values.companyName,
          description: values.description,
          website: values.website,
          logo: values.logo,
          coverImage: values.coverImage,
          streetAddress: values.streetAddress,
          zipCode: values.zipCode,
          city: values.city,
          country: values.country,
          uidNumber: values.uidNumber,
          contactPerson: values.contactPerson,
          phoneNumber: values.phoneNumber,
          businessEmail: values.businessEmail,
          openingHours: values.openingHours,
        });

        if (!result.success) {
          toast.error(result.error || t("profileUpdateError"));
          return;
        }

        // Email only changes after the user confirms via the link Better Auth sends.
        if (emailChanged) {
          toast.info(t("emailConfirmation"));
        }

        toast.success(t("profileUpdateSuccess"));
        router.refresh();
        form.reset(values);
      } catch (error: unknown) {
        toast.error((error as Error)?.message || t("unexpectedError"));
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("personalTitle")}</CardTitle>
            <CardDescription>{t("personalDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="text"
                name="name"
                label={t("nameLabel")}
                placeholder={t("namePlaceholder")}
                disabled={isPending}
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="email"
                name="email"
                label={t("emailLabel")}
                placeholder={t("emailPlaceholder")}
                disabled={isPending}
              />
              <div className="space-y-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="file"
                  name="image"
                  label={t("profileImageLabel")}
                  disabled={isPending}
                />
                {imagePreviewUrl && (
                  <ImagePreview
                    src={imagePreviewUrl}
                    alt={t("profileImageAlt")}
                    aspectClass="w-32 h-32"
                    onRemove={() =>
                      form.setValue("image", undefined, { shouldDirty: true })
                    }
                  />
                )}
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Company information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("companyTitle")}</CardTitle>
            <CardDescription>{t("companyDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="companyName"
                  label={t("companyNameLabel")}
                  placeholder={t("companyNamePlaceholder")}
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="uidNumber"
                  label={t("uidLabel")}
                  placeholder="CHE-123.456.789"
                  disabled={isPending}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="url"
                  name="website"
                  label={t("websiteLabel")}
                  placeholder="https://www.acme.ch"
                  disabled={isPending}
                />
                <div className="space-y-4">
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="file"
                    name="logo"
                    label={t("logoLabel")}
                    disabled={isPending}
                  />
                  {logoPreviewUrl && (
                    <ImagePreview
                      src={logoPreviewUrl}
                      alt={t("logoAlt")}
                      aspectClass="w-32 h-32"
                      onRemove={() =>
                        form.setValue("logo", undefined, {
                          shouldDirty: true,
                        })
                      }
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="file"
                  name="coverImage"
                  label={t("coverLabel")}
                  disabled={isPending}
                />
                {coverPreviewUrl && (
                  <ImagePreview
                    src={coverPreviewUrl}
                    alt={t("coverAlt")}
                    aspectClass="w-full h-40"
                    onRemove={() =>
                      form.setValue("coverImage", undefined, {
                        shouldDirty: true,
                      })
                    }
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="email"
                  name="businessEmail"
                  label={t("businessEmailLabel")}
                  placeholder="info@acme.ch"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="tel"
                  name="phoneNumber"
                  label={t("phoneLabel")}
                  placeholder="+41 79 123 45 67"
                  disabled={isPending}
                />
              </div>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="text"
                name="contactPerson"
                label={t("contactPersonLabel")}
                placeholder="Max Mustermann"
                disabled={isPending}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>{t("addressTitle")}</CardTitle>
            <CardDescription>{t("addressDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="text"
                name="streetAddress"
                label={t("streetLabel")}
                placeholder={t("streetPlaceholder")}
                disabled={isPending}
              />
              <div className="grid grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="zipCode"
                  label={t("zipLabel")}
                  placeholder="8000"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="city"
                  label={t("cityLabel")}
                  placeholder={t("cityPlaceholder")}
                  disabled={isPending}
                >
                  {swissCities.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>{t("descriptionTitle")}</CardTitle>
            <CardDescription>{t("descriptionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.TEXTAREA}
                name="description"
                label={t("descriptionLabel")}
                className="min-h-[120px]"
                placeholder={t("descriptionPlaceholder")}
                disabled={isPending}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      {/* Opening hours */}
      <Card>
        <CardHeader>
          <CardTitle>{t("openingHoursTitle")}</CardTitle>
          <CardDescription>{t("openingHoursDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fields.length > 0 ? (
              fields.map((item, index) => (
                <OpeningHourRow
                  key={item.id}
                  control={form.control}
                  index={index}
                  dayLabel={t(`days.${item.day}`)}
                  openLabel={t("isOpen")}
                  closedLabel={t("isClosed")}
                  isPending={isPending}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("noOpeningHours")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={isPending || !form.formState.isDirty} type="submit">
          {isPending ? (
            <>
              <Spinner />
              {t("saving")}
            </>
          ) : (
            t("save")
          )}
        </Button>
      </div>
    </form>
  );
};
