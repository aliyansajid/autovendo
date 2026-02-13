"use client";

import { Button } from "@repo/ui/src/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@repo/ui/src/components/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/src/components/accordion";
import { ScrollArea } from "@repo/ui/src/components/scroll-area";
import { Label } from "@repo/ui/src/components/label";
import { Input } from "@repo/ui/src/components/input";
import { Checkbox } from "@repo/ui/src/components/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "@repo/ui/src/components/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import { useState } from "react";
import { Filter } from "lucide-react";
import { makes, countries } from "@/data";

export function AdvancedSearch() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="w-full">
          <Button variant="outline" className="w-full">
            <Filter /> Advanced Filters
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Detail Search</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <Accordion
                type="multiple"
                defaultValue={[
                  "basic",
                  "vehicle",
                  "equipment",
                  "appearance",
                  "history",
                ]}
                className="w-full"
              >
                {/* Basic Specifications & Location */}
                <AccordionItem value="basic">
                  <AccordionTrigger>
                    Basic Specifications & Location
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-6 pt-4">
                      {/* Make + Model Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Make</Label>
                          <Select>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              {makes.map((group) => (
                                <SelectGroup key={group.label}>
                                  <SelectLabel>{group.label}</SelectLabel>
                                  {group.items.map((make) => (
                                    <SelectItem
                                      key={make.value}
                                      value={make.value}
                                    >
                                      {make.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Model</Label>
                          <Select disabled>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent />
                          </Select>
                        </div>
                      </div>

                      {/* Location + Zip Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Select defaultValue="europe">
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.flag} {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Zip Code</Label>
                          <Input placeholder="Zip Code" />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Vehicle Characteristics */}
                <AccordionItem value="vehicle">
                  <AccordionTrigger>Vehicle Characteristics</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-8 pt-4">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">
                          Body Type
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Compact",
                            "Convertible",
                            "Coupe",
                            "SUV/Off-Road/Pick-Up",
                            "Station Wagon",
                            "Sedan",
                            "Van",
                            "Transporter",
                            "Other",
                          ].map((type) => (
                            <div
                              key={type}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox id={`body-${type}`} />
                              <Label
                                htmlFor={`body-${type}`}
                                className="font-normal"
                              >
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-semibold">
                          Fuel Type
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Hybrid (Electric/Gasoline)",
                            "Hybrid (Electric/Diesel)",
                            "Gasoline",
                            "CNG",
                            "Diesel",
                            "Electric",
                            "Hydrogen",
                            "LPG",
                            "Ethanol",
                            "Others",
                          ].map((type) => (
                            <div
                              key={type}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox id={`fuel-${type}`} />
                              <Label
                                htmlFor={`fuel-${type}`}
                                className="font-normal"
                              >
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-semibold">
                          Transmission
                        </Label>
                        <div className="flex gap-4">
                          {["Automatic", "Manual", "Semi-automatic"].map(
                            (type) => (
                              <div
                                key={type}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox id={`gear-${type}`} />
                                <Label
                                  htmlFor={`gear-${type}`}
                                  className="font-normal"
                                >
                                  {type}
                                </Label>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Seller & History */}
                <AccordionItem value="history">
                  <AccordionTrigger>Seller & History</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                        <Label>Seller</Label>
                        <RadioGroup defaultValue="all" className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="seller-all" />
                            <Label htmlFor="seller-all">All</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dealer" id="seller-dealer" />
                            <Label htmlFor="seller-dealer">Dealer</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="private"
                              id="seller-private"
                            />
                            <Label htmlFor="seller-private">Private</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label>Vehicle History</Label>
                        <div className="flex flex-col gap-2">
                          {[
                            "Guarantee",
                            "Full service history",
                            "Non-smoking vehicle",
                          ].map((item) => (
                            <div
                              key={item}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox id={`history-${item}`} />
                              <Label htmlFor={`history-${item}`}>{item}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Optional Equipment */}
                <AccordionItem value="equipment">
                  <AccordionTrigger>Optional Equipment</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                      {[
                        "4WD",
                        "ABS",
                        "Adaptive Cruise Control",
                        "Air conditioning",
                        "Automatic climate control",
                        "Cruise control",
                        "LED Headlights",
                        "Multi-function steering wheel",
                        "Navigation system",
                        "Power windows",
                        "Seat heating",
                        "Trailer hitch",
                        "Xenon headlights",
                      ].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                          <Checkbox id={`eq-${item}`} />
                          <Label htmlFor={`eq-${item}`}>{item}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Appearance */}
                <AccordionItem value="appearance">
                  <AccordionTrigger>Appearance</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-6 pt-4">
                      <div className="space-y-4">
                        <Label>Body Color</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { name: "Beige", color: "#dbaf6e" },
                            { name: "Blue", color: "#0059b2" },
                            { name: "Brown", color: "#994200" },
                            { name: "Bronze", color: "#DB9D5D" },
                            { name: "Yellow", color: "#f7c81e" },
                            { name: "Grey", color: "#949494" },
                            { name: "Green", color: "#38a614" },
                            { name: "Red", color: "#d91a2a" },
                            { name: "Black", color: "#000000" },
                            { name: "Silver", color: "#c4c4c4" },
                            { name: "Violet", color: "#991289" },
                            { name: "White", color: "#ffffff" },
                            { name: "Orange", color: "#ff7500" },
                            { name: "Gold", color: "#e8c84a" },
                          ].map((c) => (
                            <div
                              key={c.name}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                id={`color-${c.name}`}
                                className="w-4 h-4"
                              />
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-4 h-4 rounded-full border shadow-sm"
                                  style={{ backgroundColor: c.color }}
                                />
                                <span className="text-sm">{c.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label>Upholstery</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Alcantara",
                            "Cloth",
                            "Full leather",
                            "Part leather",
                            "Velour",
                            "Other",
                          ].map((u) => (
                            <div
                              key={u}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox id={`uph-${u}`} />
                              <Label htmlFor={`uph-${u}`}>{u}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Offer Details */}
                <AccordionItem value="offer">
                  <AccordionTrigger>Offer Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                        <Label>Online Since</Label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Day</SelectItem>
                            <SelectItem value="3">3 Days</SelectItem>
                            <SelectItem value="7">7 Days</SelectItem>
                            <SelectItem value="14">14 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="vat" />
                        <Label htmlFor="vat">VAT deductible</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        </div>
        <SheetFooter className="px-6 py-4 border-t w-full flex-row gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Remove all filters
          </Button>
          <Button onClick={() => setIsOpen(false)}>2,029,498 results</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
