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

interface SocialLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

export const Footer = () => {
  return (
    <footer className="bg-secondary">
      <div className="max-w-285 mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-white/20 pb-6 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <CarFront className="text-white" />
              </div>
              <h3 className="font-bold text-2xl tracking-tight">Autovendo</h3>
            </div>
            <p className="max-w-md text-muted-foreground leading-relaxed text-sm">
              Entdecken Sie Ihr perfektes Fahrzeug in unserer Premium-Auswahl.
              Wir bieten Tausende von zertifizierten Gebraucht- und Neuwagen von
              europäischen Top-Marken zu unschlagbaren Preisen und mit
              transparenter Historie.
            </p>
            <div className="flex gap-3 pt-1">
              <SocialLink href="#" icon={Facebook} label="Facebook" />
              <SocialLink href="#" icon={Twitter} label="Twitter" />
              <SocialLink href="#" icon={Instagram} label="Instagram" />
              <SocialLink href="#" icon={Linkedin} label="LinkedIn" />
            </div>
          </div>

          <div className="flex flex-col lg:items-end justify-center space-y-3">
            <h4 className="font-semibold text-base">
              Bleiben Sie auf der Überholspur
            </h4>
            <p className="text-sm text-muted-foreground lg:text-right">
              Abonnieren Sie unseren Newsletter für die neuesten Angebote,
              Fahrzeug-News und exklusive Aktionen.
            </p>
            <form className="flex w-full max-w-sm items-center gap-2 mt-1">
              <Input type="email" placeholder="Ihre E-Mail-Adresse" />
              <Button type="submit">
                <Send />
                Abonnieren
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wider text-xs">
              Entdecken
            </h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/about">Über uns</FooterLink>
              <FooterLink href="/how-it-works">So funktioniert's</FooterLink>
              <FooterLink href="/pricing">Preise</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wider text-xs">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/faq">FAQ</FooterLink>
              <FooterLink href="/help">Hilfe-Center</FooterLink>
              <FooterLink href="/safety">Sicherheitstipps</FooterLink>
              <FooterLink href="/feedback">Feedback</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wider text-xs">
              Rechtliches
            </h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/privacy">Datenschutz</FooterLink>
              <FooterLink href="/terms">AGB</FooterLink>
              <FooterLink href="/cookies">Cookie-Richtlinien</FooterLink>
              <FooterLink href="/disclaimer">Impressum</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wider text-xs">
              Kontakt
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>
                  Autobahnstr. 123,
                  <br />
                  10115 Berlin, Deutschland
                </span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <Link href="tel:+41793223520">+41 79 322 35 20</Link>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <Link href="mailto:support@autovendo.com">
                  support@autovendo.com
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-6 border-t border-border text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Autovendo. Alle Rechte
            vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon: Icon, label }: SocialLinkProps) => (
  <Link
    href={href}
    aria-label={label}
    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all duration-300"
  >
    <Icon size={16} />
  </Link>
);

const FooterLink = ({ href, children }: FooterLinkProps) => (
  <li>
    <Link
      href={href}
      className="flex items-center gap-2 group text-muted-foreground hover:text-primary transition-colors"
    >
      <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors" />
      {children}
    </Link>
  </li>
);
