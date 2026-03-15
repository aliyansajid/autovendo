import { DealersList } from "./_components/dealers-list";
import { getDealers } from "@/app/actions/dealer.actions";

export default async function DealersPage(props: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const page = Number(searchParams.page) || 1;

  const initialData = await getDealers({
    searchQuery: q,
    page: page,
    pageSize: 5,
  });

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              Entdecken Sie unsere Händler
            </h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Von exklusiven Sportwagen bis zu zuverlässigen Familienautos – bei
              unseren verifizierten Händlern finden Sie das passende Fahrzeug.
            </p>
          </div>
        </div>
      </div>

      <DealersList initialData={initialData} />
    </>
  );
}
