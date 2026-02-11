import { ShieldCheck, Car, Search } from "lucide-react";

const About = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[800px] mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6 text-black">About Autovendo</h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Autovendo is your premier destination for finding the perfect vehicle
          in Switzerland and across Europe. Whether you're looking for a
          reliable daily driver, a luxury cruiser, or a high-performance sports
          car, our platform connects you with trusted dealers and private
          sellers. We prioritize transparency, quality, and a seamless user
          experience to make your car buying journey as enjoyable as the drive
          itself.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="p-4 flex flex-col items-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-primary">
              Trusted Sellers
            </h3>
            <p className="text-gray-500">
              Verified dealerships and private listings you can rely on.
            </p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Car className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-primary">
              Wide Selection
            </h3>
            <p className="text-gray-500">
              Thousands of vehicles from top manufacturers across the continent.
            </p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-primary">Easy Search</h3>
            <p className="text-gray-500">
              Advanced filters to help you find exactly what you're looking for.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
