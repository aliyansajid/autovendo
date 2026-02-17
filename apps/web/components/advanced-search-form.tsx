"use client";

import { useState } from "react";
import {
  Car,
  Truck,
  Bike,
  Caravan,
  X,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { Label } from "@repo/ui/src/components/label";
import { Checkbox } from "@repo/ui/src/components/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/src/components/accordion";
import {
  RadioGroup,
  RadioGroupItem,
} from "@repo/ui/src/components/radio-group";
import { Slider } from "@repo/ui/src/components/slider";
import { Badge } from "@repo/ui/src/components/badge";
import { Separator } from "@repo/ui/src/components/separator";
import { MakeSelectorDialog } from "@/components/make-selector-dialog";
import { MakeExclusionDialog } from "@/components/make-exclusion-dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupInput,
} from "@repo/ui/src/components/input-group";

export function AdvancedSearchForm() {
  const [vehicleType, setVehicleType] = useState("car");
  const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
  const [isExclusionModalOpen, setIsExclusionModalOpen] = useState(false);
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [excludedMakes, setExcludedMakes] = useState<string[]>([]);

  const handleMakeSelect = (make: string) => {
    setSelectedMakes((prev) => (prev.includes(make) ? prev : [...prev, make]));
    setIsMakeModalOpen(false);
  };

  const removeMake = (make: string) => {
    setSelectedMakes((prev) => prev.filter((m) => m !== make));
  };

  const handleMakeExclusion = (make: string) => {
    setExcludedMakes((prev) => (prev.includes(make) ? prev : [...prev, make]));
    setIsExclusionModalOpen(false);
  };

  const removeExcludedMake = (make: string) => {
    setExcludedMakes((prev) => prev.filter((m) => m !== make));
  };

  // Mock data for filters
  const bodyTypes = [
    { id: "compact", label: "Compact", count: 16896 },
    { id: "sedan", label: "Limousine", count: 29280 },
    { id: "station-wagon", label: "Kombi", count: 21292 },
    { id: "suv", label: "SUV / Geländewagen", count: 59039 },
    { id: "coupe", label: "Coupé", count: 8466 },
    { id: "convertible", label: "Cabriolet", count: 8822 },
    { id: "van", label: "Minivan", count: 9189 },
    { id: "bus", label: "Bus", count: 1568 },
    { id: "pickup", label: "Pick-up", count: 1375 },
  ];

  const fuelTypes = [
    { id: "petrol", label: "Benzin", count: 73255 },
    { id: "diesel", label: "Diesel", count: 26789 },
    { id: "hybrid", label: "Hybrid", count: 38590 },
    { id: "electric", label: "Elektro", count: 16281 },
    { id: "gas", label: "Gas", count: 185 },
  ];

  return (
    <div className="w-full max-w-285 mx-auto pb-16 px-4">
      <div className="flex items-center justify-between py-6 border-b">
        <h1 className="text-2xl font-bold">Filter</h1>
        <Button variant="ghost">
          Schliessen <X />
        </Button>
      </div>

      <div className="flex overflow-x-auto gap-8 mb-8 pt-8 scrollbar-hide border-b">
        {[
          { id: "car", label: "Personenwagen", icon: Car },
          { id: "camper", label: "Wohnmobil", icon: Caravan },
          { id: "utility", label: "Nutzfahrzeug", icon: Truck },
          { id: "truck", label: "Lastwagen", icon: Truck },
          { id: "trailer", label: "Anhänger", icon: Truck },
          { id: "moto", label: "Motorrad", icon: Bike },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setVehicleType(type.id)}
            className={`flex items-center gap-3 pb-4 min-w-max transition-all ${
              vehicleType === type.id
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <type.icon className="w-6 h-6" />
            <span className="text-base font-medium">{type.label}</span>
          </button>
        ))}
      </div>

      <Accordion
        type="multiple"
        defaultValue={[
          "make",
          "basic",
          "tech",
          "equipment",
          "appearance",
          "energy",
          "more",
        ]}
        className="w-full space-y-8"
      >
        <AccordionItem value="make" className="border-none">
          <AccordionTrigger className="text-xl font-bold text-blue-600 hover:no-underline flex items-center">
            Marke & Modell
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="flex flex-row gap-4">
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={() => setIsMakeModalOpen(true)}
              >
                <PlusCircle />
                Hinzufügen
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={() => setIsExclusionModalOpen(true)}
              >
                <MinusCircle />
                Ausschliessen
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {selectedMakes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Include
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedMakes.map((make) => (
                      <Badge
                        key={make}
                        variant="secondary"
                        className="pl-3 pr-1 py-1 text-sm bg-muted text-foreground flex items-center gap-1"
                      >
                        {make}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => removeMake(make)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {excludedMakes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                    Exclude
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {excludedMakes.map((make) => (
                      <Badge
                        key={make}
                        variant="destructive"
                        className="pl-3 pr-1 py-1 text-sm flex items-center gap-1"
                      >
                        {make}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent hover:text-white"
                          onClick={() => removeExcludedMake(make)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedMakes.length === 0 && excludedMakes.length === 0 && (
                <div className="p-8 bg-muted/10 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
                  Keine Fahrzeuge ausgewählt.
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <MakeSelectorDialog
          open={isMakeModalOpen}
          onOpenChange={setIsMakeModalOpen}
          onSelect={handleMakeSelect}
        />

        <MakeExclusionDialog
          open={isExclusionModalOpen}
          onOpenChange={setIsExclusionModalOpen}
          onSelect={handleMakeExclusion}
        />

        <Separator />

        <AccordionItem value="basic" className="border-none">
          <AccordionTrigger className="text-xl font-bold text-blue-600 hover:no-underline flex items-center">
            Basisdaten
          </AccordionTrigger>
          <AccordionContent className="pt-6 space-y-12">
            {/* Row 1: Year, Mileage, Price (3 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Year */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Jahr</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                {/* Histogram placeholder */}
                <div className="h-16 flex items-end justify-between gap-1 px-2 pb-2 opacity-50">
                  {[
                    10, 20, 30, 45, 60, 80, 60, 40, 20, 10, 50, 90, 100, 30,
                  ].map((h, i) => (
                    <div
                      key={i}
                      className="w-full bg-muted-foreground/30 rounded-t"
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
                <Slider
                  defaultValue={[1980, 2026]}
                  max={2026}
                  min={1900}
                  step={1}
                  className="py-2"
                />
                <div className="flex gap-2">
                  <InputGroup>
                    <InputGroupInput
                      placeholder="1900"
                      className="text-right"
                    />
                  </InputGroup>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="2026"
                      className="text-right"
                    />
                  </InputGroup>
                </div>
              </div>

              {/* Mileage */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">
                    Kilometerstand
                  </Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                {/* Histogram placeholder */}
                <div className="h-16 flex items-end justify-between gap-1 px-2 pb-2 opacity-50">
                  {[100, 80, 60, 40, 20, 10, 5, 5, 20, 40, 60, 30, 10, 5].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="w-full bg-muted-foreground/30 rounded-t"
                        style={{ height: `${h}%` }}
                      ></div>
                    ),
                  )}
                </div>
                <Slider
                  defaultValue={[0, 400000]}
                  max={400000}
                  step={1000}
                  className="py-2"
                />
                <div className="flex gap-2 text-sm">
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>km</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="0" className="text-right" />
                  </InputGroup>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>km</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="400'000+"
                      className="text-right"
                    />
                  </InputGroup>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Preis</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>

                <RadioGroup defaultValue="price" className="flex gap-6 mb-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price" id="r-price" />
                    <Label htmlFor="r-price" className="font-normal">
                      Kaufpreis
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="leasing" id="r-leasing" />
                    <Label htmlFor="r-leasing" className="font-normal">
                      Leasingrate
                    </Label>
                  </div>
                </RadioGroup>

                {/* Histogram placeholder */}
                <div className="h-10 flex items-end justify-between gap-1 px-2 pb-2 opacity-50">
                  {[20, 30, 50, 70, 90, 60, 40, 30, 20, 10, 10, 5].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="w-full bg-muted-foreground/30 rounded-t"
                        style={{ height: `${h}%` }}
                      ></div>
                    ),
                  )}
                </div>
                <Slider
                  defaultValue={[0, 100000]}
                  max={200000}
                  step={1000}
                  className="py-2"
                />
                <div className="flex gap-2 text-sm">
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>CHF</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="0" className="text-right" />
                  </InputGroup>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>CHF</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="1'000'000+"
                      className="text-right"
                    />
                  </InputGroup>
                </div>
              </div>
            </div>

            <Separator />

            {/* Row 2: Condition, MFK, Accident (3 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Condition */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Zustand</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { l: "Neu", c: "39'690" },
                    { l: "Occasion", c: "114'599" },
                    { l: "Oldtimer", c: "1'638" },
                    { l: "Vorführmodell", c: "2'100" },
                  ].map((item) => (
                    <div
                      key={item.l}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`cond-${item.l}`} />
                        <Label
                          htmlFor={`cond-${item.l}`}
                          className="font-normal"
                        >
                          {item.l}
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.c}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MFK & Warranty */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">
                    MFK & Garantie
                  </Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="mfk" />
                      <Label htmlFor="mfk" className="font-normal">
                        Ab MFK
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      112'484
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="warranty" />
                      <Label htmlFor="warranty" className="font-normal">
                        Mit Garantie
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      107'688
                    </span>
                  </div>
                </div>
              </div>

              {/* Accident */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">
                    Unfallfahrzeug
                  </Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="accident" />
                      <Label htmlFor="accident" className="font-normal">
                        Unfallfahrzeug
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">750</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="no-accident" />
                      <Label htmlFor="no-accident" className="font-normal">
                        Kein Unfallfahrzeug
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      155'177
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Seller Type + Body Type */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    Verkäufertyp{" "}
                    <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-sm text-[10px] px-1 h-4">
                      NEW
                    </Badge>
                  </Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between max-w-xs">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="p-private" />
                      <Label htmlFor="p-private" className="font-normal">
                        Privat
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      10'424
                    </span>
                  </div>
                  <div className="flex items-center justify-between max-w-xs">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="p-dealer" />
                      <Label htmlFor="p-dealer" className="font-normal">
                        Händler
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      145'503
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Aufbauart</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                  {bodyTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox id={`body-${type.id}`} className="mt-1" />
                        <Car
                          className="w-8 h-8 text-foreground/70"
                          strokeWidth={1}
                        />{" "}
                        {/* Placeholder Icon */}
                        <Label
                          htmlFor={`body-${type.id}`}
                          className="font-normal text-base cursor-pointer"
                        >
                          {type.label}
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {type.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <Separator />

        <AccordionItem value="tech" className="border-none">
          <AccordionTrigger className="text-xl font-bold text-blue-600 hover:no-underline flex items-center">
            Technischen Daten
          </AccordionTrigger>
          <AccordionContent className="pt-6 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Fuel */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Treibstoff</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="space-y-3">
                  {fuelTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`fuel-${type.id}`} />
                        <Label
                          htmlFor={`fuel-${type.id}`}
                          className="font-normal"
                        >
                          {type.label}
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {type.count}
                      </span>
                    </div>
                  ))}
                  {/* Expand Option */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fuel-more" />
                      <Label htmlFor="fuel-more" className="font-normal">
                        Weitere Treibstoffe
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">71</span>
                  </div>
                </div>
              </div>

              {/* Transmission */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Getriebe</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="trans-auto" />
                      <Label htmlFor="trans-auto" className="font-normal">
                        Automatikgetriebe
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      126'610
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="trans-manual" />
                      <Label htmlFor="trans-manual" className="font-normal">
                        Schaltgetriebe
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      28'543
                    </span>
                  </div>
                </div>
              </div>

              {/* Drive */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Antrieb</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { l: "Allrad", c: "74'647" },
                    { l: "Hinterradantrieb", c: "18'230" },
                    { l: "Vorderradantrieb", c: "62'124" },
                  ].map((item) => (
                    <div
                      key={item.l}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`drive-${item.l}`} />
                        <Label
                          htmlFor={`drive-${item.l}`}
                          className="font-normal"
                        >
                          {item.l}
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.c}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Power/Displacement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-6">
              {/* Power */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">Leistung</Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <RadioGroup defaultValue="ps" className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ps" id="p-ps" />
                      <Label htmlFor="p-ps">PS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="kw" id="p-kw" />
                      <Label htmlFor="p-kw">kW</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Slider
                  defaultValue={[0, 1500]}
                  max={1500}
                  step={10}
                  className="py-2"
                />
                <div className="flex gap-2">
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>PS</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="0" className="text-right" />
                  </InputGroup>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>PS</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="1'500+"
                      className="text-right"
                    />
                  </InputGroup>
                </div>
              </div>

              {/* Displacement (Hubraum) */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Hubraum</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 8000]}
                  max={8000}
                  step={100}
                  className="py-2"
                />
                <div className="flex gap-2">
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>cm³</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="1" className="text-right" />
                  </InputGroup>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>cm³</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="8'000+"
                      className="text-right"
                    />
                  </InputGroup>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Zylinder</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <Slider
                  defaultValue={[1, 16]}
                  max={16}
                  min={1}
                  step={1}
                  className="py-2"
                />
                <div className="flex gap-2">
                  <InputGroup>
                    <InputGroupInput placeholder="1" className="text-right" />
                  </InputGroup>
                  <InputGroup>
                    <InputGroupInput placeholder="16" className="text-right" />
                  </InputGroup>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <Separator />

        <AccordionItem value="equipment" className="border-none">
          <AccordionTrigger className="text-xl font-bold text-blue-600 hover:no-underline flex items-center">
            Ausstattung
          </AccordionTrigger>
          <AccordionContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Reuse existing layout, maybe add counts if available */}
              {[
                "Android Auto",
                "Apple CarPlay",
                "Bluetooth",
                "DAB Radio",
                "Head-up display",
                "Innovation package",
                "Navigation system",
                "Parking sensors",
                "Reversing camera",
                "Seat heating",
                "Sports seats",
                "Sunroof",
                "Touchscreen",
                "Trailer hitch",
              ].map((feat) => (
                <div key={feat} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feat-${feat.replace(/\s+/g, "-").toLowerCase()}`}
                  />
                  <Label
                    htmlFor={`feat-${feat.replace(/\s+/g, "-").toLowerCase()}`}
                    className="font-normal"
                  >
                    {feat}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <Separator />

        <AccordionItem value="appearance" className="border-none">
          <AccordionTrigger className="text-xl font-bold text-blue-600 hover:no-underline flex items-center">
            Farbe
          </AccordionTrigger>
          <AccordionContent className="pt-6 space-y-8">
            {/* Exterior Color */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <Label className="text-base font-semibold">Aussenfarbe</Label>
                <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                  Zurücksetzen
                </span>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Checkbox id="metallic" />
                <Label htmlFor="metallic" className="font-normal">
                  Metallic
                </Label>
                <span className="text-sm text-muted-foreground ml-auto">
                  86'371
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-8">
                {[
                  {
                    name: "Anthrazit",
                    id: "anthracite",
                    hex: "#383E42",
                    count: "3'088",
                  },
                  {
                    name: "Beige",
                    id: "beige",
                    hex: "#F5F5DC",
                    count: "1'431",
                  },
                  {
                    name: "Schwarz",
                    id: "black",
                    hex: "#000000",
                    count: "42'755",
                  },
                  { name: "Blau", id: "blue", hex: "#0000FF", count: "14'069" },
                  {
                    name: "Bordeaux",
                    id: "bordeaux",
                    hex: "#800020",
                    count: "494",
                  },
                  {
                    name: "Braun",
                    id: "brown",
                    hex: "#964B00",
                    count: "1'571",
                  },
                  { name: "Gold", id: "gold", hex: "#FFD700", count: "282" },
                  { name: "Grau", id: "gray", hex: "#808080", count: "38'970" },
                  { name: "Grün", id: "green", hex: "#008000", count: "4'011" },
                  {
                    name: "Mehrfarbig",
                    id: "multicolor",
                    gradient:
                      "linear-gradient(135deg, #FF0000 0%, #00FF00 50%, #0000FF 100%)",
                    count: "195",
                  },
                  {
                    name: "Orange",
                    id: "orange",
                    hex: "#FFA500",
                    count: "809",
                  },
                  { name: "Pink", id: "pink", hex: "#FFC0CB", count: "48" },
                  { name: "Rot", id: "red", hex: "#FF0000", count: "7'508" },
                  {
                    name: "Silber",
                    id: "silver",
                    hex: "#C0C0C0",
                    count: "6'845",
                  },
                  {
                    name: "Türkis",
                    id: "turquoise",
                    hex: "#40E0D0",
                    count: "106",
                  },
                  {
                    name: "Violett",
                    id: "violet",
                    hex: "#EE82EE",
                    count: "429",
                  },
                  {
                    name: "Weiss",
                    id: "white",
                    hex: "#FFFFFF",
                    border: true,
                    count: "31'613",
                  },
                  {
                    name: "Gelb",
                    id: "yellow",
                    hex: "#FFFF00",
                    count: "1'328",
                  },
                ].map((color) => (
                  <div
                    key={color.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox id={`ext-${color.id}`} />
                      <div
                        className={`w-4 h-4 rounded-full border border-border/20 ${color.border ? "border-border" : ""}`}
                        style={{ background: color.gradient || color.hex }}
                      />
                      <Label
                        htmlFor={`ext-${color.id}`}
                        className="font-normal cursor-pointer"
                      >
                        {color.name}
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {color.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Interior Color */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <Label className="text-base font-semibold">Innenfarbe</Label>
                <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                  Zurücksetzen
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-8">
                {[
                  {
                    name: "Anthrazit",
                    id: "int-anthracite",
                    hex: "#383E42",
                    count: "14'041",
                  },
                  {
                    name: "Beige",
                    id: "int-beige",
                    hex: "#F5F5DC",
                    count: "5'276",
                  },
                  {
                    name: "Schwarz",
                    id: "int-black",
                    hex: "#000000",
                    count: "88'421",
                  },
                  {
                    name: "Blau",
                    id: "int-blue",
                    hex: "#0000FF",
                    count: "1'396",
                  },
                  {
                    name: "Bordeaux",
                    id: "int-bordeaux",
                    hex: "#800020",
                    count: "237",
                  },
                  {
                    name: "Braun",
                    id: "int-brown",
                    hex: "#964B00",
                    count: "3'284",
                  },
                  {
                    name: "Gold",
                    id: "int-gold",
                    hex: "#FFD700",
                    count: "214",
                  },
                  {
                    name: "Grau",
                    id: "int-gray",
                    hex: "#808080",
                    count: "12'103",
                  },
                  {
                    name: "Grün",
                    id: "int-green",
                    hex: "#008000",
                    count: "213",
                  },
                  {
                    name: "Mehrfarbig",
                    id: "int-multicolor",
                    gradient:
                      "linear-gradient(135deg, #FF0000 0%, #00FF00 50%, #0000FF 100%)",
                    count: "2'232",
                  },
                  {
                    name: "Orange",
                    id: "int-orange",
                    hex: "#FFA500",
                    count: "119",
                  },
                  { name: "Pink", id: "int-pink", hex: "#FFC0CB", count: "5" },
                  {
                    name: "Rot",
                    id: "int-red",
                    hex: "#FF0000",
                    count: "1'437",
                  },
                  {
                    name: "Silber",
                    id: "int-silver",
                    hex: "#C0C0C0",
                    count: "141",
                  },
                  {
                    name: "Türkis",
                    id: "int-turquoise",
                    hex: "#40E0D0",
                    count: "16",
                  },
                  {
                    name: "Violett",
                    id: "int-violet",
                    hex: "#EE82EE",
                    count: "17",
                  },
                  {
                    name: "Weiss",
                    id: "int-white",
                    hex: "#FFFFFF",
                    border: true,
                    count: "1'366",
                  },
                  {
                    name: "Gelb",
                    id: "int-yellow",
                    hex: "#FFFF00",
                    count: "45",
                  },
                ].map((color) => (
                  <div
                    key={color.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox id={color.id} />
                      <div
                        className={`w-4 h-4 rounded-full border border-border/20 ${color.border ? "border-border" : ""}`}
                        style={{ background: color.gradient || color.hex }}
                      />
                      <Label
                        htmlFor={color.id}
                        className="font-normal cursor-pointer"
                      >
                        {color.name}
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {color.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <Separator />

        <AccordionItem value="energy" className="border-none">
          <AccordionTrigger className="text-xl font-bold text-blue-600 hover:no-underline flex items-center">
            Energie & Umwelt
          </AccordionTrigger>
          <AccordionContent className="pt-6 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Verbrauch</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 30]}
                  min={0}
                  max={30}
                  step={0.1}
                  className="py-2"
                />
                <div className="flex gap-2">
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>1/100km</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="0" className="text-right" />
                  </InputGroup>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>1/100km</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="30+" className="text-right" />
                  </InputGroup>
                </div>
              </div>

              {/* CO2 Emissions */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">
                    CO2-Emissionen
                  </Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 560]}
                  min={0}
                  max={560}
                  step={1}
                  className="py-2"
                />
                <div className="flex gap-2">
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>g/km</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="0" className="text-right" />
                  </InputGroup>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>g/km</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="560+"
                      className="text-right"
                    />
                  </InputGroup>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">
                    Energieeffizienz
                  </Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { l: "A", c: "6'162" },
                    { l: "B", c: "9'312" },
                    { l: "C", c: "9'383" },
                    { l: "D", c: "14'222" },
                    { l: "E", c: "17'259" },
                    { l: "F", c: "14'799" },
                    { l: "G", c: "35'069" },
                  ].map((item) => (
                    <div
                      key={item.l}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`eff-${item.l}`} />
                        <Label
                          htmlFor={`eff-${item.l}`}
                          className="font-normal"
                        >
                          {item.l}
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.c}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Euronorm</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { l: "Euro 1", c: "1'452" },
                    { l: "Euro 2", c: "919" },
                    { l: "Euro 3", c: "2'094" },
                    { l: "Euro 4", c: "8'772" },
                    { l: "Euro 5", c: "13'983" },
                    { l: "Euro 5+", c: "57" },
                    { l: "Euro 6", c: "146" },
                    { l: "Euro 6a", c: "29" },
                    { l: "Euro 6b", c: "19'364" },
                    { l: "Euro 6c", c: "2'448" },
                    { l: "Euro 6d", c: "34'511" },
                    { l: "Euro 6d ISC", c: "2'700" },
                  ].map((item) => (
                    <div
                      key={item.l}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`euro-${item.l}`} />
                        <Label
                          htmlFor={`euro-${item.l}`}
                          className="font-normal"
                        >
                          {item.l}
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.c}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <Separator />

        <AccordionItem value="more" className="border-none">
          <AccordionTrigger className="text-xl font-bold text-blue-600 hover:no-underline flex items-center">
            Weitere Filter
          </AccordionTrigger>
          <AccordionContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {/* Days Listed */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">
                    Inseratedauer
                  </Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <RadioGroup defaultValue="any" className="space-y-3">
                  {[
                    "Beliebig",
                    "1 Tag",
                    "2 Tage",
                    "3 Tage",
                    "5 Tage",
                    "7 Tage",
                    "14 Tage",
                    "28 Tage",
                  ].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={day.toLowerCase()}
                        id={`day-${day}`}
                      />
                      <Label htmlFor={`day-${day}`} className="font-normal">
                        {day}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Quality Seal */}
              <div className="space-y-4 lg:col-span-2">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">
                    Qualitätslabel
                  </Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                  {[
                    { l: "AMAG", c: "7'967" },
                    { l: "Audi Occasion :plus", c: "768" },
                    { l: "Auto Welt von Rotz AG", c: "902" },
                    { l: "BMW", c: "1'873" },
                    { l: "BMW Premium Selection", c: "2'725" },
                    { l: "BYD Official Partner", c: "145" },
                    { l: "CUPRA Approved", c: "153" },
                    { l: "Jaguar Approved", c: "2" },
                    { l: "Land Rover Approved", c: "37" },
                    { l: "Merbag", c: "1'601" },
                    { l: "Mercedes-Benz Certified", c: "2'899" },
                    { l: "Mini", c: "133" },
                    { l: "Occasionen MINI NEXT", c: "227" },
                    { l: "Quality1", c: "30'309" },
                    { l: "SEAT Occasion Plus", c: "145" },
                    { l: "Skoda Occasion Plus", c: "424" },
                    { l: "VFAS", c: "2'046" },
                    { l: "Volvo Selekt", c: "1'581" },
                    { l: "VW Occasion Plus", c: "770" },
                  ].map((item) => (
                    <div
                      key={item.l}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`seal-${item.l}`} />
                        <Label
                          htmlFor={`seal-${item.l}`}
                          className="font-normal truncate max-w-50"
                          title={item.l}
                        >
                          {item.l}
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {item.c}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="fixed bottom-0 left-0 right-0 py-4 px-4 md:px-0 bg-background flex justify-center items-center z-50 shadow-2xl border-t">
        <Button
          size="lg"
          className="w-full max-w-3xl bg-[#FFCE00] hover:bg-[#FFCE00]/90 text-black"
        >
          155'927 Fahrzeuge anzeigen
        </Button>
      </div>
    </div>
  );
}
