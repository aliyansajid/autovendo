import { ShieldCheck, Car, Search } from "lucide-react";

const About = () => {
  return (
    <section className="py-12 pb-16 bg-white">
      <div className="max-w-[800px] mx-auto text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black">
          Über Autovendo
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Autovendo ist Ihre erste Anlaufstelle für die Suche nach dem perfekten
          Fahrzeug in der Schweiz und ganz Europa. Ob Sie einen zuverlässigen
          Alltagsbegleiter, eine luxuriöse Limousine oder einen leistungsstarken
          Sportwagen suchen – unsere Plattform verbindet Sie mit
          vertrauenswürdigen Händlern und Privatverkäufern. Wir legen Wert auf
          Transparenz, Qualität und eine reibungslose Benutzererfahrung, damit
          Ihr Autokauf genauso angenehm ist wie die Fahrt selbst.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="p-4 flex flex-col items-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-primary">
              Vertrauenswürdige Verkäufer
            </h3>
            <p className="text-gray-500">
              Geprüfte Händler und private Angebote, auf die Sie sich verlassen
              können
            </p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Car className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-primary">
              Große Auswahl
            </h3>
            <p className="text-gray-500">
              Tausende Fahrzeuge von Top-Herstellern aus dem gesamten Kontinent
            </p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-primary">
              Einfache Suche
            </h3>
            <p className="text-gray-500">
              Erweiterte Filter helfen Ihnen, genau das zu finden, wonach Sie
              suchen
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
