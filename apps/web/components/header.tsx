import { Button } from "@repo/ui/src/components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetHeader,
} from "@repo/ui/components/sheet";
import { Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-linear-to-r from-primary to-primary/80">
      <div className="flex items-center justify-between max-w-285 mx-auto h-16 px-4">
        <div className="font-bold text-xl">Autovendo</div>
        <div className="hidden md:flex items-center gap-3">
          <Select defaultValue="english">
            <SelectTrigger className="w-32 bg-white">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="german">Deutsch</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="italian">Italiano</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="secondary" className="bg-white">
            Post free ad
          </Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="text-white">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-6 px-4">
              <Select defaultValue="english">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="german">Deutsch</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="italian">Italiano</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button className="w-full">Post free ad</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
