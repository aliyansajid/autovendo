import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/src/components/button";
import { Mail, MapPin, Phone, Send, MailIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@repo/ui/src/components/input-group";

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

export const Footer = () => {
  return (
    <>
      <footer className="bg-muted">
        <div className="max-w-285 mx-auto px-4 pt-8 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <div className="space-y-3">
              <Link href="/" className="block">
                <Image
                  src="/logo-footer.svg"
                  alt="Autovendo Logo"
                  width={320}
                  height={96}
                  className="h-16 w-auto object-contain"
                />
              </Link>

              <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
                Entdecken Sie Ihr perfektes Fahrzeug in unserer Premium-Auswahl.
                Wir bieten Tausende von zertifizierten Gebraucht- und Neuwagen
                von europäischen Top-Marken zu unschlagbaren Preisen und mit
                transparenter Historie.
              </p>

              <p className="max-w-md text-xs text-muted-foreground leading-relaxed italic">
                <strong>
                  Autovendo.ch verzichtet bewusst auf Social Media.
                </strong>
                &nbsp; Bei uns stehen&nbsp;
                <strong>
                  direkter Kontakt, persönliche Erreichbarkeit und echte
                  Gespräche
                </strong>
                &nbsp;im Mittelpunkt – von Mensch zu Mensch, nicht über Likes
                oder Algorithmen.
              </p>
            </div>

            <div className="flex flex-col lg:items-end justify-center space-y-3">
              <h4 className="font-semibold text-base">
                Bleiben Sie auf der Überholspur
              </h4>
              <p className="text-sm text-muted-foreground lg:text-right">
                Abonnieren Sie unseren Newsletter für die neuesten Angebote,
                Fahrzeug-News und exklusive Aktionen.
              </p>
              <form className="flex items-center w-full max-w-sm gap-3">
                <InputGroup>
                  <InputGroupInput
                    type="email"
                    placeholder="Ihre E-Mail-Adresse"
                  />
                  <InputGroupAddon>
                    <MailIcon />
                  </InputGroupAddon>
                </InputGroup>
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
                <FooterLink href="about">Über uns</FooterLink>
                <FooterLink href="insertionsregeln">
                  Insertionsregeln
                </FooterLink>
                <FooterLink href="pricing">Preise</FooterLink>
                <FooterLink href="contact">Kontakt</FooterLink>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 uppercase tracking-wider text-xs">
                Support
              </h4>
              <ul className="space-y-2 text-sm">
                <FooterLink href="faq">FAQ</FooterLink>
                <FooterLink href="sicherheitshinweise">
                  Sicherheitshinweise
                </FooterLink>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 uppercase tracking-wider text-xs">
                Rechtliches
              </h4>
              <ul className="space-y-2 text-sm">
                <FooterLink href="datenschutz">Datenschutz</FooterLink>
                <FooterLink href="agb">AGB</FooterLink>
                <FooterLink href="privatsphaere">
                  Privatsphäre-Einstellungen
                </FooterLink>
                <FooterLink href="impressum">Impressum</FooterLink>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 uppercase tracking-wider text-xs">
                Kontakt
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="size-4 text-muted-foreground mt-0.5" />
                  <span>
                    Riehenstrasse 157,
                    <br />
                    4058 Basel, Switzerland
                  </span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="size-4 text-muted-foreground" />
                  <Link href="tel:+41793223520">+41 79 322 35 20</Link>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="size-4 text-muted-foreground" />
                  <Link href="mailto:info@autovendo.ch">info@autovendo.ch</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-center pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Autovendo. Alle Rechte
              vorbehalten.
            </p>
          </div>
        </div>
      </footer>

      <Link
        href="https://wa.me/41793223520"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Kontaktieren Sie uns auf WhatsApp"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white w-14 h-14 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
          <path
            d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z"
            fillRule="evenodd"
          />
        </svg>
      </Link>
    </>
  );
};

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
