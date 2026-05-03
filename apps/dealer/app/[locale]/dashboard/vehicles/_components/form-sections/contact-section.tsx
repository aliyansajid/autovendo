import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { ExternalLink } from "lucide-react";

export function ContactSection() {
  const t = useTranslations("VehicleFormSections");
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>{t("contactInfo")}</CardTitle>
              <CardDescription>{t("contactInfoDesc")}</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/settings/profile">
                {t("editProfile")}
                <ExternalLink />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              name="companyName"
              label={t("company")}
              placeholder={t("companyPlaceholder")}
              disabled={true}
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              name="businessEmail"
              label={t("businessEmail")}
              placeholder={t("businessEmailPlaceholder")}
              disabled={true}
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              name="phoneNumber"
              label={t("businessPhone")}
              placeholder={t("phonePlaceholder")}
              disabled={true}
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              name="address"
              label={t("street")}
              placeholder={t("streetPlaceholder")}
              disabled={true}
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              name="zipCode"
              label={t("zip")}
              placeholder={t("zip")}
              disabled={true}
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              name="city"
              label={t("city")}
              placeholder={t("city")}
              disabled={true}
            />
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-muted/30 border rounded-lg text-sm text-muted-foreground">
        <p>{t("contactNote")}</p>
      </div>
    </div>
  );
}
