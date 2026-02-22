import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Button } from "@repo/ui/src/components/button";
import { PlusCircle, CarFront } from "lucide-react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-linear-to-r from-primary to-primary/80">
      <div className="flex items-center justify-between container mx-auto py-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90"
        >
          <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
            <CarFront className="text-white" size={20} />
          </div>
          <span className="text-xl text-white font-bold">Autovendo</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Select defaultValue="german">
            <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors [&_svg]:text-white!">
              <SelectValue placeholder="Sprache" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="german">DE</SelectItem>
                <SelectItem value="english">EN</SelectItem>
                <SelectItem value="french">FR</SelectItem>
                <SelectItem value="italian">IT</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button className="bg-white hover:bg-white/90 text-primary">
            <PlusCircle />
            Abonnieren
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
