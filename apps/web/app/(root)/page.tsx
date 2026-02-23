import { About } from "./_components/about";
import { FeaturedGarage } from "./_components/featured-garage";
import { FeaturedListings } from "./_components/featured-listings";
import { SearchForm } from "./_components/search-form";

const page = () => {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <SearchForm />
        </div>
      </div>
      <FeaturedListings />
      <FeaturedGarage />
      <About />
    </>
  );
};

export default page;
