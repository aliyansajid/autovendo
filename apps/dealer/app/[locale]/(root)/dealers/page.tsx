import type { Metadata } from "next";
import { buildMetadata, PAGE_META } from "@/lib/seo";
import { DealersList } from "./_components/dealers-list";
import { getDealersFromApi } from "@/lib/api/dealers";
import { createDealerSearchSchema } from "@/schema/dealer-search-schema";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return buildMetadata(locale, "/dealers", PAGE_META.dealers);
}

export default async function DealersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations("DealersPage");

  // Parse and validate search params
  const t_schema = await getTranslations("DealerSearchSchema");
  const schema = createDealerSearchSchema(t_schema);
  const query = schema.parse(searchParams);

  const initialData = await getDealersFromApi({
    searchQuery: query.q,
    page: query.page,
    pageSize: 12,
  });

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">{t("title")}</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <DealersList initialData={initialData} />
    </>
  );
}
