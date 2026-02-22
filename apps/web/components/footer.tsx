import Link from "next/link";
import { Button } from "@repo/ui/src/components/button";
import { Input } from "@repo/ui/src/components/input";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  CarFront,
  Send,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-linear-to-r from-primary to-primary/80 text-white border-t border-primary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-white/20 pb-6 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <CarFront className="text-white" />
              </div>
              <h3 className="font-bold text-2xl text-white tracking-tight">
                Autovendo
              </h3>
            </div>
            <p className="max-w-md text-white/80 leading-relaxed text-sm">
              Entdecken Sie Ihr perfektes Fahrzeug in unserer Premium-Auswahl.
              Wir bieten Tausende von zertifizierten Gebraucht- und Neuwagen von
              europäischen Top-Marken zu unschlagbaren Preisen und mit
              transparenter Historie.
            </p>
            <div className="flex gap-3 pt-1">
              <Link
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white hover:text-primary hover:border-white transition-all duration-300"
              >
                <Facebook size={16} />
              </Link>
              <Link
                href="#"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white hover:text-primary hover:border-white transition-all duration-300"
              >
                <Twitter size={16} />
              </Link>
              <Link
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white hover:text-primary hover:border-white transition-all duration-300"
              >
                <Instagram size={16} />
              </Link>
              <Link
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white hover:text-primary hover:border-white transition-all duration-300"
              >
                <Linkedin size={16} />
              </Link>
            </div>
          </div>

          <div className="flex flex-col lg:items-end justify-center space-y-3">
            <h4 className="font-semibold text-white text-base">
              Bleiben Sie auf der Überholspur
            </h4>
            <p className="text-white/80 text-sm lg:text-right">
              Abonnieren Sie unseren Newsletter für die neuesten Angebote,
              Fahrzeug-News und exklusive Aktionen.
            </p>
            <form className="flex w-full max-w-sm items-center gap-2 mt-1">
              <Input
                type="email"
                placeholder="Ihre E-Mail-Adresse"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white"
              />
              <Button
                type="submit"
                className="bg-white hover:bg-white/90 px-4 text-primary"
              >
                <Send />
                Abonnieren
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">
              Entdecken
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors"></span>
                  Über uns
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors"></span>
                  So funktioniert's
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors"></span>
                  Preise
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors"></span>
                  Hilfe-Center
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors"></span>
                  Sicherheitstipps
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors"></span>
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">
              Rechtliches
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors"></span>
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors"></span>
                  AGB
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors"></span>
                  Cookie-Richtlinien
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors"></span>
                  Impressum
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">
              Kontakt
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-white/80">
                <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>
                  Autobahnstr. 123,
                  <br />
                  10115 Berlin, Deutschland
                </span>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Phone className="w-4 h-4 text-white shrink-0" />
                <span>+49 (0) 30 1234 5678</span>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <span>support@autovendo.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-6 border-t border-white/20 text-xs text-white/60">
          <p>
            &copy; {new Date().getFullYear()} Autovendo. Alle Rechte
            vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
