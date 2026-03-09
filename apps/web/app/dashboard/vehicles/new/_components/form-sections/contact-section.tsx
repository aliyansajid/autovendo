import { useFormContext } from "react-hook-form";
import Link from "next/link";
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
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Kontaktinformationen</CardTitle>
              <CardDescription>
                Ihre hinterlegten Geschäftsdaten für dieses Inserat
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/settings/profile">
                Profil anpassen
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
              label="Firma"
              placeholder="Firmenname aus Profil"
              disabled={true}
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              name="businessEmail"
              label="Geschäfts-E-Mail"
              placeholder="email@beispiel.ch"
              disabled={true}
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              name="phoneNumber"
              label="Geschäfts-Telefon"
              placeholder="+41 XX XXX XX XX"
              disabled={true}
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              name="address"
              label="Strasse"
              placeholder="Strasse"
              disabled={true}
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              name="zipCode"
              label="PLZ"
              placeholder="PLZ"
              disabled={true}
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              name="city"
              label="Ort"
              placeholder="Ort"
              disabled={true}
            />
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-muted/30 border rounded-lg text-sm text-muted-foreground">
        <p>
          <strong>Hinweis:</strong> Diese Informationen werden in Ihrem Inserat
          angezeigt. Falls Sie die Angaben ändern möchten, passen Sie bitte Ihre
          Profil-Einstellungen an.
        </p>
      </div>
    </div>
  );
}
