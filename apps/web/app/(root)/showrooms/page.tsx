import { ShowroomsList } from "./_components/showrooms-list";

export default function ShowroomsPage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-3">
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

      <ShowroomsList />
    </>
  );
}
