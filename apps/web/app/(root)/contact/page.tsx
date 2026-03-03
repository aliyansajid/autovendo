"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/src/components/button";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { Separator } from "@repo/ui/src/components/separator";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { Field, FieldGroup } from "@repo/ui/src/components/field";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Name muss mindestens 3 Zeichen lang sein")
    .max(50, "Name darf maximal 50 Zeichen lang sein"),
  email: z.email("Ungültige E-Mail-Adresse"),
  phone: z
    .string()
    .regex(/^(\+41|0041|0)[0-9\s.-]{8,}$/, "Ungültige Schweizer Telefonnummer"),
  subject: z
    .string()
    .min(3, "Betreff muss mindestens 3 Zeichen lang sein")
    .max(100, "Betreff darf maximal 100 Zeichen lang sein"),
  message: z
    .string()
    .min(10, "Nachricht muss mindestens 10 Zeichen lang sein")
    .max(1000, "Nachricht darf maximal 1000 Zeichen lang sein"),
});

export default function ContactPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {}

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">Kontakt</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Wir sind für Sie da. Nehmen Sie Kontakt mit uns auf - wir freuen
              uns auf Ihre Nachricht.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-6">Kontaktinformationen</h2>
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Mail className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">E-Mail</h3>
                    <Link
                      href="mailto:info@autovendo.ch"
                      className="text-muted-foreground hover:text-primary hover:underline transition-colors"
                    >
                      info@autovendo.ch
                    </Link>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Telefon</h3>
                    <Link
                      href="tel:+41793223520"
                      className="text-muted-foreground hover:text-primary hover:underline transition-colors"
                    >
                      +41 79 322 35 20
                    </Link>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Adresse</h3>
                    <p className="text-muted-foreground">
                      Riehenstrasse 157,
                      <br />
                      4058 Basel, Switzerland
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Öffnungszeiten</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>Montag - Freitag: 08:00 - 18:00</p>
                      <p>Samstag: 09:00 - 16:00</p>
                      <p>Sonntag: Geschlossen</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section className="bg-muted p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-3">Schnelle Antwort</h3>
              <p className="text-muted-foreground text-sm">
                Wir antworten in der Regel innerhalb von 24 Stunden auf alle
                Anfragen. Bei dringenden Anliegen rufen Sie uns bitte direkt an.
              </p>
            </section>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup>
                <h2 className="text-2xl font-bold">
                  Senden Sie uns eine Nachricht
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-6">
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="text"
                    name="name"
                    label="Name"
                    placeholder="Ihr vollständiger Name"
                  />
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="email"
                    name="email"
                    label="E-Mail"
                    placeholder="ihre.email@beispiel.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-6">
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="tel"
                    name="phone"
                    label="Telefon"
                    placeholder="+41 12 345 67 89"
                  />
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="text"
                    name="subject"
                    label="Betreff"
                    placeholder="Worum geht es?"
                  />
                </div>

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.TEXTAREA}
                  name="message"
                  label="Nachricht"
                  placeholder="Schreiben Sie uns Ihre Nachricht..."
                  className="h-32"
                />

                <Field>
                  <div className="flex w-full justify-end">
                    <Button type="submit" className="w-full md:w-auto">
                      Nachricht senden
                    </Button>
                  </div>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
