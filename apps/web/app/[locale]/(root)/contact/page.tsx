"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useMemo } from "react";
import { Button } from "@repo/ui/src/components/button";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { Separator } from "@repo/ui/src/components/separator";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Field, FieldGroup } from "@repo/ui/src/components/field";
import { sendContactMessage } from "@/app/actions/contact.actions";
import { Spinner } from "@repo/ui/src/components/spinner";
import { toast } from "sonner";
import { createContactFormSchema } from "@/schema/contact-schema";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("ContactPage");
  const tSchema = useTranslations("ContactSchema");
  const [isPending, startTransition] = useTransition();

  const contactFormSchema = useMemo(
    () => createContactFormSchema(tSchema),
    [tSchema],
  );

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof contactFormSchema>) {
    startTransition(async () => {
      const result = await sendContactMessage({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject || undefined,
        message: data.message || undefined,
      });

      result.ok
        ? toast.success(result.message ?? t("successDefault"))
        : toast.error(result.error ?? t("errorDefault"));
      form.reset();
    });
  }

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">{t("title")}</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("contactInfo")}</h2>
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Mail className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{t("emailLabel")}</h3>
                    <Link
                      href="mailto:info@autovendo.ch"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      info@autovendo.ch
                    </Link>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{t("phoneLabel")}</h3>
                    <Link
                      href="tel:+41793223520"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      +41 (0)79 322 35 20
                    </Link>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{t("addressLabel")}</h3>
                    <p className="text-muted-foreground">
                      Bielstrasse 78,
                      <br />
                      2555 Brugg / BE, Switzerland
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{t("hoursLabel")}</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>{t("hours.weekdays")}</p>
                      <p>{t("hours.saturday")}</p>
                      <p>{t("hours.sunday")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section className="bg-muted p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-3">{t("quickReplyTitle")}</h3>
              <p className="text-muted-foreground text-sm">
                {t("quickReplyText")}
              </p>
            </section>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <h2 className="text-2xl font-bold">{t("formTitle")}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="text"
                    name="name"
                    label={t("nameLabel")}
                    placeholder={t("namePlaceholder")}
                  />
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="email"
                    name="email"
                    label={t("emailFormLabel")}
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="tel"
                    name="phone"
                    label={t("phoneFormLabel")}
                    placeholder="+41 12 345 67 89"
                  />
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="text"
                    name="subject"
                    label={t("subjectLabel")}
                    placeholder={t("subjectPlaceholder")}
                  />
                </div>

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.TEXTAREA}
                  name="message"
                  label={t("messageLabel")}
                  placeholder={t("messagePlaceholder")}
                  className="h-32"
                />

                <Field>
                  <div className="flex w-full justify-end">
                    <Button
                      type="submit"
                      className="w-full md:w-auto"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Spinner />
                          {t("submitting")}
                        </>
                      ) : (
                        <>
                          {t("submit")}
                          <Send />
                        </>
                      )}
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
