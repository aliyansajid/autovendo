"use client";

import { useState } from "react";
import { Button } from "@repo/ui/src/components/button";
import { Input } from "@repo/ui/src/components/input";
import { Label } from "@repo/ui/src/components/label";
import { Switch } from "@repo/ui/src/components/switch";
import { Badge } from "@repo/ui/src/components/badge";
import { ScrollArea } from "@repo/ui/src/components/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/src/components/dialog";
import { Search, ChevronRight, ArrowLeft, SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@repo/ui/src/components/input-group";
interface MakeSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (make: string) => void;
}

export function MakeSelectorDialog({
  open,
  onOpenChange,
  onSelect,
}: MakeSelectorDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [exclude, setExclude] = useState(false);

  // Data for popular makes with logos
  const popularMakes = [
    {
      name: "Audi",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/audi.04e8f0dc.png?w=320&q=75",
    },
    {
      name: "BMW",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/bmw.d80d5e29.png?w=320&q=75",
    },
    {
      name: "Ford",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/ford.8ebffc41.png?w=320&q=75",
    },
    {
      name: "Mercedes-Benz",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/mercedes-benz.df6b0bf0.png?w=320&q=75",
    },

    {
      name: "Renault",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/renault.35f93614.png?w=320&q=75",
    },
    {
      name: "Skoda",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/skoda.f1c9e839.png?w=320&q=75",
    },
    {
      name: "Toyota",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/toyota.9a8f48b4.png?w=320&q=75",
    },
    {
      name: "VW",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/vw.81540e42.png?w=320&q=75",
    },
    {
      name: "Volvo",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/volvo.b9d848a4.png?w=320&q=75",
    },
    {
      name: "Fiat",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/fiat.2c8b543a.png?w=320&q=75",
    },
    {
      name: "Seat",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/seat.8a3b4153.png?w=320&q=75",
    },
    {
      name: "Porsche",
      logo: "https://assets.autoscout24.ch/l/_next/static/media/porsche.0adcb83f.png?w=320&q=75",
    },
  ];

  // Manual list from snippet (truncated for brevity but including key ones)
  const allMakesList = [
    { label: "AC", count: 19 },
    { label: "Acura", count: 1 },
    { label: "Adler", count: 1 },
    { label: "Alfa Romeo", count: 1881 },
    { label: "Alpine", count: 170 },
    { label: "Aston Martin", count: 467 },
    { label: "Audi", count: 13082 },
    { label: "Austin", count: 9 },
    { label: "Austin-Healey", count: 26 },
    { label: "Bentley", count: 452 },
    { label: "BMW", count: 16279 },
    { label: "BMW-Alpina", count: 125 },
    { label: "Bugatti", count: 6 },
    { label: "Buick", count: 29 },
    { label: "BYD", count: 649 },
    { label: "Cadillac", count: 250 },
    { label: "Caterham", count: 14 },
    { label: "Chevrolet", count: 815 },
    { label: "Chrysler", count: 162 },
    { label: "Citroen", count: 2426 },
    { label: "Cupra", count: 2172 },
    { label: "Dacia", count: 1479 },
    { label: "Daewoo", count: 13 },
    { label: "Daihatsu", count: 130 },
    { label: "Daimler", count: 37 },
    { label: "Datsun", count: 5 },
    { label: "De Tomaso", count: 13 },
    { label: "Dodge", count: 563 },
    { label: "DS Automobiles", count: 532 },
    { label: "Ferrari", count: 1053 },
    { label: "Fiat", count: 3735 },
    { label: "Fisker", count: 14 },
    { label: "Ford", count: 5831 },
    { label: "Genesis", count: 139 },
    { label: "GMC", count: 20 },
    { label: "Honda", count: 1446 },
    { label: "Hummer", count: 37 },
    { label: "Hyundai", count: 4182 },
    { label: "Infiniti", count: 59 },
    { label: "Innocenti", count: 5 },
    { label: "Isuzu", count: 46 },
    { label: "Iveco", count: 110 },
    { label: "Jaguar", count: 1836 },
    { label: "Jeep", count: 1834 },
    { label: "Kia", count: 3959 },
    { label: "Lada", count: 34 },
    { label: "Lamborghini", count: 432 },
    { label: "Lancia", count: 251 },
    { label: "Land Rover", count: 3757 },
    { label: "Lexus", count: 587 },
    { label: "Ligier", count: 41 },
    { label: "Lincoln", count: 52 },
    { label: "Lotus", count: 129 },
    { label: "Maserati", count: 712 },
    { label: "Maybach", count: 25 },
    { label: "Mazda", count: 2795 },
    { label: "McLaren", count: 144 },
    { label: "Mercedes-Benz", count: 19890 },
    { label: "MG", count: 254 },
    { label: "Microcar", count: 17 },
    { label: "Mini", count: 2890 },
    { label: "Mitsubishi", count: 1093 },
    { label: "Morgan", count: 74 },
    { label: "Nissan", count: 2065 },
    { label: "Opel", count: 4293 },
    { label: "Peugeot", count: 3678 },
    { label: "Polestar", count: 247 },
    { label: "Pontiac", count: 151 },
    { label: "Porsche", count: 5049 },
    { label: "Renault", count: 4579 },
    { label: "Rolls-Royce", count: 141 },
    { label: "Rover", count: 68 },
    { label: "Saab", count: 167 },
    { label: "Seat", count: 3180 },
    { label: "Skoda", count: 5873 },
    { label: "Smart", count: 669 },
    { label: "SsangYong", count: 298 },
    { label: "Subaru", count: 1856 },
    { label: "Suzuki", count: 2479 },
    { label: "Tesla", count: 1528 },
    { label: "Toyota", count: 5988 },
    { label: "Triumph", count: 153 },
    { label: "TVR", count: 23 },
    { label: "Volkswagen", count: 19721 }, // VW
    { label: "Volvo", count: 3887 },
    { label: "Wiesmann", count: 13 },
  ];

  const filteredMakes =
    searchTerm === ""
      ? allMakesList
      : allMakesList.filter((make) =>
          make.label.toLowerCase().includes(searchTerm.toLowerCase()),
        );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md md:max-w-xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
      >
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-2"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft />
            </Button>
            <DialogTitle className="text-xl font-bold">Make</DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="exclude-mode"
              checked={exclude}
              onCheckedChange={setExclude}
            />
            <Label
              htmlFor="exclude-mode"
              className="font-normal cursor-pointer"
            >
              Exclude
            </Label>
            <Badge
              variant="secondary"
              className="bg-yellow-400 text-black hover:bg-yellow-500 text-[10px] h-4 px-1 rounded-sm"
            >
              NEW
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-4 border-b shrink-0">
          <InputGroup>
            <InputGroupInput
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="flex-1 relative min-h-0">
          <ScrollArea className="h-full w-full absolute inset-0">
            <div className="p-4 space-y-6">
              {searchTerm === "" && (
                <div className="mb-6 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Popular makes
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {popularMakes.map((make) => (
                      <button
                        key={make.name}
                        onClick={() => onSelect(make.name)}
                        className="aspect-4/3 flex items-center justify-center border rounded-lg hover:bg-muted/50 p-2 transition-colors relative overflow-hidden bg-white"
                        title={make.name}
                      >
                        {make.logo ? (
                          <img
                            src={make.logo}
                            alt={make.name}
                            className="object-contain h-full w-full p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/50 text-xs font-bold text-center">
                            {make.name}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Last Searched Placeholder */}
              {searchTerm === "" && (
                <div className="mb-6 space-y-2">
                  <h3 className="text-sm text-foreground">
                    Last searched by you
                  </h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 border rounded-full text-sm hover:bg-muted/50 transition-colors">
                      AC
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-0 divide-y divide-border/40">
                <h3 className="text-sm font-semibold text-foreground p-2">
                  All makes
                </h3>
                {filteredMakes.map((make) => (
                  <button
                    key={make.label}
                    onClick={() => onSelect(make.label)}
                    className="w-full flex items-center justify-between py-3 px-2 hover:bg-muted/30 group transition-colors"
                  >
                    <span className="text-base">{make.label}</span>
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                      <span className="text-sm tabular-nums text-muted-foreground/60">
                        {make.count}
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
