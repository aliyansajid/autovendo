import { useFormContext, useWatch } from "react-hook-form";
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

export function ContactSection() {
  const { control } = useFormContext();
  const sameAsBilling = useWatch({ control, name: "sameAsBilling" });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rechnungsadresse</CardTitle>
          <CardDescription>Rechnungsadresse für das Inserat</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              name="billingFirstName"
              label="Vorname"
              placeholder="Vorname eingeben"
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              name="billingLastName"
              label="Nachname"
              placeholder="Nachname eingeben"
            />
          </div>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT}
            name="billingStreet"
            label="Strasse und Nr"
            placeholder="Strasse und Nr eingeben"
          />

          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              name="billingZip"
              label="PLZ"
              placeholder="PLZ"
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              name="billingCity"
              label="Ort"
              placeholder="Ort"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              name="billingCountry"
              label="Land"
              placeholder="Switzerland"
              disabled={true}
              defaultValue="Switzerland"
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              name="billingPhone"
              label="Telefonnummer"
              placeholder="+41 XX XXX XX XX"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Standort des Fahrzeugs / Halter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CustomFormField
            control={control}
            fieldType={FormFieldType.CHECKBOX}
            name="sameAsBilling"
            label="Entspricht der Rechnungsadresse"
          />

          {!sameAsBilling && (
            <div className="grid gap-6 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-3">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="ownerFirstName"
                  label="Vorname"
                  placeholder="Vorname eingeben"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="ownerLastName"
                  label="Nachname"
                  placeholder="Nachname eingeben"
                />
              </div>

              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT}
                name="ownerStreet"
                label="Strasse und Nr"
                placeholder="Strasse und Nr eingeben"
              />

              <div className="grid grid-cols-2 gap-3">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="ownerZip"
                  label="PLZ"
                  placeholder="PLZ"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="ownerCity"
                  label="Ort"
                  placeholder="Ort"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="ownerCountry"
                  label="Land"
                  placeholder="Switzerland"
                  disabled={true}
                  defaultValue="Switzerland"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="ownerPhone"
                  label="Telefonnummer"
                  placeholder="+41 XX XXX XX XX"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
