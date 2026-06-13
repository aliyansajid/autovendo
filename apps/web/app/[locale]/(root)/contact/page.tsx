import type { Metadata } from "next";
import { buildMetadata, PAGE_META } from "@/lib/seo";
import { ContactForm } from "./_components/contact-form";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return buildMetadata(locale, "/contact", PAGE_META.contact);
}

export default function ContactPage() {
  return <ContactForm />;
}
