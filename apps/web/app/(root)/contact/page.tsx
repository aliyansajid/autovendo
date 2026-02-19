"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Form } from "@repo/ui/src/components/form";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { Button } from "@repo/ui/src/components/button";
import { Separator } from "@repo/ui/components/separator";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Betreff muss mindestens 3 Zeichen lang sein"),
  message: z.string().min(10, "Nachricht muss mindestens 10 Zeichen lang sein"),
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

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast.success("Vielen Dank für Ihre Nachricht! Wir melden uns bald.");
    form.reset();
  }

  return (
    <>
      {/* Hero Section */}
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 md:py-24 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold">Kontakt</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto">
              Wir sind für Sie da. Nehmen Sie Kontakt mit uns auf – wir freuen
              uns auf Ihre Nachricht.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-285 mx-auto py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  Kontaktinformationen
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">E-Mail</h3>
                      <a
                        href="mailto:info@autovendo.ch"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        info@autovendo.ch
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Telefon</h3>
                      <a
                        href="tel:+41123456789"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        +41 12 345 67 89
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Adresse</h3>
                      <p className="text-muted-foreground">
                        Autovendo AG
                        <br />
                        Musterstrasse 123
                        <br />
                        8000 Zürich
                        <br />
                        Schweiz
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
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
                  Anfragen. Bei dringenden Anliegen rufen Sie uns bitte direkt
                  an.
                </p>
              </section>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold">
                    Senden Sie uns eine Nachricht
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      name="name"
                      label="Name"
                      placeholder="Ihr vollständiger Name"
                    />
                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      name="email"
                      label="E-Mail"
                      placeholder="ihre.email@beispiel.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      name="phone"
                      label="Telefon (optional)"
                      placeholder="+41 12 345 67 89"
                    />
                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
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

                  <Button type="submit" size="lg" className="w-full md:w-auto">
                    Nachricht senden
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
