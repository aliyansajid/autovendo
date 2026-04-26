"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const POPULAR_BRANDS = [
  "Audi", "BMW", "Mercedes-Benz", "Volkswagen", "Toyota",
  "Ford", "Opel", "Renault", "Peugeot", "Skoda",
  "Seat", "Honda", "Hyundai", "Kia", "Volvo",
  "Mazda", "Nissan", "Citroën", "Fiat", "Porsche",
];

export function BrandsSection() {
  const t = useTranslations("BrandsSection");

  return (
    <section className="w-full max-w-285 mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">{t("title")}</h2>
      <div className="flex flex-wrap gap-3">
        {POPULAR_BRANDS.map((brand) => (
          <Link
            key={brand}
            href={`/cars?make=${encodeURIComponent(brand)}`}
            className="px-5 py-2.5 rounded-full border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-sm font-medium"
          >
            {brand}
          </Link>
        ))}
      </div>
    </section>
  );
}
