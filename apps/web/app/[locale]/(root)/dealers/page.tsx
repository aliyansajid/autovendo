import { Suspense } from "react";
import { DealersList } from "./_components/dealers-list";
import { getDealers } from "@/app/actions/dealer.actions";
import { dealerSearchSchema } from "@/schema/dealer-search-schema";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function DealersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations("DealersPage");

  // Parse and validate search params
  const query = dealerSearchSchema.parse(searchParams);

  const initialData = await getDealers({
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

      <Suspense fallback={null}>
        <DealersList initialData={initialData} />
      </Suspense>
    </>
  );
}
