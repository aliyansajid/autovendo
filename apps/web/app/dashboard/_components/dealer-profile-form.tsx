"use client";

import { z } from "zod";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dealerProfileSchema } from "@/schema/profile-schema";
import { Button } from "@repo/ui/src/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/src/components/card";
import { FieldGroup } from "@repo/ui/src/components/field";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { authClient } from "@repo/auth/client";
import { useTransition, useEffect, useState } from "react";
import { toast } from "sonner";
import { getPresignedUploadUrl } from "@/app/actions/storage.actions";
import { updateDealerProfile } from "@/app/actions/dealer.actions";
import { Spinner } from "@repo/ui/src/components/spinner";
import { DealerProfile } from "@/types/dealer";
import { swissCities } from "@/lib/constants/swiss-cities";
import { SelectItem } from "@repo/ui/src/components/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormValues = z.infer<typeof dealerProfileSchema>;

// ---------------------------------------------------------------------------
// useObjectUrl — creates an object URL for File inputs and revokes on cleanup
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// OpeningHourRow — isolated component so useWatch only re-renders the row
// ---------------------------------------------------------------------------

function OpeningHourRow({
  control,
  index,
  day,
  isPending,
}: {
  control: Control<FormValues>;
  index: number;
  day: string;
  isPending: boolean;
}) {
  const isOpen = useWatch({
    control,
    name: `openingHours.${index}.isOpen`,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 p-3 rounded-lg border bg-muted/30">
      <span className="font-medium">{day}</span>
      <div className="flex items-center gap-2">
        <CustomFormField
          control={control}
          fieldType={FormFieldType.CHECKBOX}
          name={`openingHours.${index}.isOpen`}
          label={isOpen ? "Geöffnet" : "Geschlossen"}
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
            className="h-9"
            disabled={isPending}
          />
          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT}
            inputType="time"
            name={`openingHours.${index}.closeTime`}
            placeholder="18:00"
            className="h-9"
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
    <div className={`relative ${aspectClass} rounded-lg overflow-hidden border`}>
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
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(dealerProfileSchema),
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
            day:
              oh.day.charAt(0).toUpperCase() + oh.day.slice(1).toLowerCase(),
            isOpen: oh.isOpen,
            openTime: oh.openTime || "08:00",
            closeTime: oh.closeTime || "18:00",
          }))
        : [
            { day: "Montag", isOpen: true, openTime: "08:00", closeTime: "18:00" },
            { day: "Dienstag", isOpen: true, openTime: "08:00", closeTime: "18:00" },
            { day: "Mittwoch", isOpen: true, openTime: "08:00", closeTime: "18:00" },
            { day: "Donnerstag", isOpen: true, openTime: "08:00", closeTime: "18:00" },
            { day: "Freitag", isOpen: true, openTime: "08:00", closeTime: "18:00" },
            { day: "Samstag", isOpen: false, openTime: "08:00", closeTime: "18:00" },
            { day: "Sonntag", isOpen: false, openTime: "08:00", closeTime: "18:00" },
          ],
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: "openingHours" });

  // useWatch for image fields — each only triggers its own re-render
  const imageValue = useWatch({ control: form.control, name: "image" });
  const logoValue = useWatch({ control: form.control, name: "logo" });
  const coverValue = useWatch({ control: form.control, name: "coverImage" });

  // Object URL lifecycle management — no memory leaks
  const imagePreviewUrl = useObjectUrl(imageValue as File | string | undefined);
  const logoPreviewUrl = useObjectUrl(logoValue as File | string | undefined);
  const coverPreviewUrl = useObjectUrl(coverValue as File | string | undefined);

  const uploadFile = async (file: File, type: "branding" | "profiles") => {
    const res = await getPresignedUploadUrl({
      country: "ch",
      dealerId: initialData?.id || "temp",
      type,
      filename: file.name,
      contentType: file.type,
    });

    if (!res.success || !res.uploadUrl) throw new Error(res.error);

    const uploadRes = await fetch(res.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadRes.ok) throw new Error("Datei-Upload fehlgeschlagen.");

    return res.publicUrl;
  };

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        let imageUrl = values.image;
        let logoUrl = values.logo;
        let coverImageUrl = values.coverImage;

        if (values.image instanceof File) {
          imageUrl = await uploadFile(values.image, "profiles");
        }
        if (values.logo instanceof File) {
          logoUrl = await uploadFile(values.logo, "branding");
        }
        if (values.coverImage instanceof File) {
          coverImageUrl = await uploadFile(values.coverImage, "branding");
        }

        // User name / profile image update
        const userUpdates: { name?: string; image?: string } = {};
        if ((values.name || "") !== (initialData?.user?.name || "")) {
          userUpdates.name = values.name;
        }
        if ((imageUrl as string | null) !== (initialData?.user?.image || null)) {
          userUpdates.image = (imageUrl as string) || "";
        }

        if (Object.keys(userUpdates).length > 0) {
          const { error } = await authClient.updateUser(userUpdates);
          if (error) {
            toast.error(
              error.message ||
                "Benutzerinformationen konnten nicht aktualisiert werden.",
            );
            return;
          }
        }

        // Email change (sends confirmation)
        if (values.email !== initialData?.user?.email) {
          const { error } = await authClient.changeEmail({
            newEmail: values.email,
            callbackURL: "/dashboard/settings/profile",
          });

          if (error) {
            toast.error(
              error.message ||
                "E-Mail-Änderung konnte nicht initiiert werden.",
            );
            return;
          }

          toast.info(
            "Eine Bestätigungs-E-Mail wurde an Ihre neue E-Mail-Adresse gesendet.",
          );
        }

        if (!initialData?.user?.id) {
          toast.error("Benutzerinformationen fehlen.");
          return;
        }

        const result = await updateDealerProfile(initialData.user.id, {
          ...values,
          image: (imageUrl as string) || null,
          logo: (logoUrl as string) || null,
          coverImage: (coverImageUrl as string) || null,
        });

        if (result.success) {
          toast.success(result.message || "Profil erfolgreich aktualisiert.");
          form.reset({
            ...values,
            image: imageUrl as string | undefined,
            logo: logoUrl as string | undefined,
            coverImage: coverImageUrl as string | undefined,
          });
        } else {
          toast.error(
            result.error ||
              "Unternehmensprofil konnte nicht aktualisiert werden.",
          );
        }
      } catch (error: any) {
        toast.error(
          error?.message ||
            "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        );
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal information */}
        <Card>
          <CardHeader>
            <CardTitle>Persönliche Informationen</CardTitle>
            <CardDescription>Ihre grundlegenden Kontodaten.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="text"
                name="name"
                label="Name"
                placeholder="Max Mustermann"
                disabled={isPending}
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="email"
                name="email"
                label="E-Mail"
                placeholder="max@beispiel.ch"
                disabled={isPending}
              />
              <div className="space-y-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="file"
                  name="image"
                  label="Profilbild"
                  disabled={isPending}
                />
                {imagePreviewUrl && (
                  <ImagePreview
                    src={imagePreviewUrl}
                    alt="Profilbild Vorschau"
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
            <CardTitle>Unternehmensinformationen</CardTitle>
            <CardDescription>Ihre Firmen- und Kontaktdaten.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="companyName"
                  label="Firmenname"
                  placeholder="ACME GmbH"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="uidNumber"
                  label="UID-Nummer"
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
                  label="Webseite"
                  placeholder="https://www.acme.ch"
                  disabled={isPending}
                />
                <div className="space-y-4">
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="file"
                    name="logo"
                    label="Firmenlogo"
                    disabled={isPending}
                  />
                  {logoPreviewUrl && (
                    <ImagePreview
                      src={logoPreviewUrl}
                      alt="Firmenlogo Vorschau"
                      aspectClass="w-32 h-32"
                      onRemove={() =>
                        form.setValue("logo", undefined, { shouldDirty: true })
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
                  label="Titelbild"
                  disabled={isPending}
                />
                {coverPreviewUrl && (
                  <ImagePreview
                    src={coverPreviewUrl}
                    alt="Titelbild Vorschau"
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
                  label="Geschäftliche E-Mail"
                  placeholder="info@acme.ch"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="tel"
                  name="phoneNumber"
                  label="Telefonnummer"
                  placeholder="+41 79 123 45 67"
                  disabled={isPending}
                />
              </div>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="text"
                name="contactPerson"
                label="Kontaktperson"
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
            <CardTitle>Adresse</CardTitle>
            <CardDescription>Wo sich Ihr Unternehmen befindet.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="text"
                name="streetAddress"
                label="Strasse und Hausnummer"
                placeholder="Bahnhofstrasse 123"
                disabled={isPending}
              />
              <div className="grid grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="zipCode"
                  label="PLZ"
                  placeholder="8000"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="city"
                  label="Stadt"
                  placeholder="Stadt auswählen"
                  disabled={isPending}
                >
                  {swissCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
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
            <CardTitle>Beschreibung</CardTitle>
            <CardDescription>Erzählen Sie uns von Ihrem Unternehmen.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.TEXTAREA}
                name="description"
                label="Beschreibung"
                className="min-h-[120px]"
                placeholder="Erzählen Sie uns von Ihrem Unternehmen..."
                disabled={isPending}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      {/* Opening hours */}
      <Card>
        <CardHeader>
          <CardTitle>Öffnungszeiten</CardTitle>
          <CardDescription>Wann Sie erreichbar sind.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fields.length > 0 ? (
              fields.map((item, index) => (
                <OpeningHourRow
                  key={item.id}
                  control={form.control}
                  index={index}
                  day={item.day}
                  isPending={isPending}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Keine Öffnungszeiten definiert.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button
          disabled={isPending || !form.formState.isDirty}
          type="submit"
        >
          {isPending ? (
            <>
              <Spinner />
              Speichert...
            </>
          ) : (
            "Profil speichern"
          )}
        </Button>
      </div>
    </form>
  );
};
