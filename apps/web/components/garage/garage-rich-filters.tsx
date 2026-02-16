"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, ChevronDown, CircleEllipsis, X } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { Label } from "@repo/ui/src/components/label";
import { Checkbox } from "@repo/ui/src/components/checkbox";
import { Slider } from "@repo/ui/src/components/slider";
import { MakeSelectorDialog } from "@/components/make-selector-dialog";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@repo/ui/src/components/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupInput,
} from "@repo/ui/src/components/input-group";
import { bodyTypes, fuelTypes, transmissions, driveTypes } from "@/data";

// Utility for classes
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

const mockHistogram = [10, 25, 40, 30, 65, 35, 20, 10, 5, 15, 40, 80, 50, 20];

interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  unit?: string;
  step?: number;
  value: [number, number];
  onValueChange: (val: [number, number]) => void;
  histogramData?: number[];
}

function RangeFilter({
  label,
  min,
  max,
  unit,
  step = 1,
  value,
  onValueChange,
  histogramData = mockHistogram,
}: RangeFilterProps) {
  return (
    <div className="space-y-4 min-w-[300px] p-4">
      <PopoverHeader>
        <PopoverTitle className="text-base font-semibold">{label}</PopoverTitle>
        <PopoverDescription
          className="text-xs cursor-pointer hover:underline"
          onClick={() => onValueChange([min, max])}
        >
          Reset
        </PopoverDescription>
      </PopoverHeader>

      {/* Histogram */}
      <div className="h-16 flex items-end justify-between gap-1 px-2 pb-2 opacity-50">
        {histogramData.map((h, i) => (
          <div
            key={i}
            className="w-full bg-muted-foreground/30 rounded-t"
            style={{ height: `${h}%` }}
          ></div>
        ))}
      </div>

      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(val) => onValueChange(val as [number, number])}
        className="py-2"
      />

      <div className="flex gap-2">
        <InputGroup>
          {unit && unit !== "CHF" && (
            <InputGroupAddon>
              <InputGroupText>{unit}</InputGroupText>
            </InputGroupAddon>
          )}
          {unit === "CHF" && (
            <InputGroupAddon>
              <InputGroupText>{unit}</InputGroupText>
            </InputGroupAddon>
          )}
          <InputGroupInput
            value={value[0]}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) onValueChange([val, value[1]]);
            }}
            className="text-right"
          />
        </InputGroup>
        <InputGroup>
          {unit && unit !== "CHF" && (
            <InputGroupAddon>
              <InputGroupText>{unit}</InputGroupText>
            </InputGroupAddon>
          )}
          {unit === "CHF" && (
            <InputGroupAddon>
              <InputGroupText>{unit}</InputGroupText>
            </InputGroupAddon>
          )}
          <InputGroupInput
            value={value[1]}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) onValueChange([value[0], val]);
            }}
            className="text-right"
          />
        </InputGroup>
      </div>
    </div>
  );
}

interface CheckboxListProps {
  title: string;
  items: { label: string; value: string; count?: number }[];
  selectedValues?: string[];
  onChange?: (selected: string[]) => void;
}

function CheckboxListFilter({
  title,
  items,
  selectedValues = [],
  onChange,
}: CheckboxListProps) {
  const toggle = (value: string) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange?.(newSelected);
  };

  return (
    <div className="space-y-4 min-w-[300px] p-4">
      <PopoverHeader>
        <PopoverTitle className="text-base font-semibold">{title}</PopoverTitle>
        <PopoverDescription
          className="text-xs cursor-pointer hover:underline"
          onClick={() => onChange?.([])}
        >
          Reset
        </PopoverDescription>
      </PopoverHeader>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.value} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`${title}-${item.value}`}
                checked={selectedValues.includes(item.value)}
                onCheckedChange={() => toggle(item.value)}
              />
              <Label
                htmlFor={`${title}-${item.value}`}
                className="font-normal cursor-pointer"
              >
                {item.label}
              </Label>
            </div>
            {item.count !== undefined && (
              <span className="text-sm text-muted-foreground">
                {item.count}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface GridFilterProps {
  title: string;
  items: { label: string; value: string; icon?: any }[];
  selectedValues?: string[];
  onChange?: (selected: string[]) => void;
}

function GridFilter({
  title,
  items,
  selectedValues = [],
  onChange,
}: GridFilterProps) {
  const toggle = (value: string) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange?.(newSelected);
  };

  return (
    <div className="space-y-4 min-w-[300px] p-4">
      <PopoverHeader>
        <PopoverTitle className="text-base font-semibold">{title}</PopoverTitle>
        <PopoverDescription
          className="text-xs cursor-pointer hover:underline"
          onClick={() => onChange?.([])}
        >
          Reset
        </PopoverDescription>
      </PopoverHeader>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.value} className="flex items-center space-x-2">
            <Checkbox
              id={`grid-${title}-${item.value}`}
              checked={selectedValues.includes(item.value)}
              onCheckedChange={() => toggle(item.value)}
            />
            {item.icon && (
              <item.icon className="w-4 h-4 text-muted-foreground" />
            )}
            <Label
              htmlFor={`grid-${title}-${item.value}`}
              className="font-normal cursor-pointer"
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GarageRichFilters() {
  const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);

  // Filter States
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([1990, 2026]);
  const [mileageRange, setMileageRange] = useState<[number, number]>([
    0, 200000,
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>(
    [],
  );
  const [selectedDrives, setSelectedDrives] = useState<string[]>([]);

  const handleMakeSelect = (make: string) => {
    setSelectedMakes((prev) => (prev.includes(make) ? prev : [...prev, make]));
    setIsMakeModalOpen(false);
  };

  const resetAll = () => {
    setSelectedMakes([]);
    setYearRange([1990, 2026]);
    setMileageRange([0, 200000]);
    setPriceRange([0, 100000]);
    setSelectedBodyTypes([]);
    setSelectedFuels([]);
    setSelectedTransmissions([]);
    setSelectedDrives([]);
  };

  const formatRangeLabel = (
    label: string,
    current: [number, number],
    def: [number, number],
    unit = "",
  ) => {
    if (current[0] === def[0] && current[1] === def[1]) return label;
    return `${current[0]}${unit} - ${current[1]}${unit}`;
  };

  const isRangeActive = (current: [number, number], def: [number, number]) => {
    return current[0] !== def[0] || current[1] !== def[1];
  };

  const getTriggerClass = (isActive: boolean) =>
    cn(
      "w-full justify-between font-normal text-muted-foreground",
      isActive && "text-primary border-blue-200 bg-blue-50",
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          variant="outline"
          onClick={() => setIsMakeModalOpen(true)}
          className={cn(getTriggerClass(selectedMakes.length > 0))}
        >
          <span className="truncate">
            {selectedMakes.length > 0
              ? selectedMakes.join(", ")
              : "Make & Model"}
          </span>
          {selectedMakes.length > 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMakes([]);
              }}
              className="hover:bg-blue-200 rounded-full p-0.5 ml-2"
            >
              <X className="h-4 w-4" />
            </div>
          ) : (
            <ChevronDown />
          )}
        </Button>

        <MakeSelectorDialog
          open={isMakeModalOpen}
          onOpenChange={setIsMakeModalOpen}
          onSelect={handleMakeSelect}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={getTriggerClass(
                isRangeActive(yearRange, [1990, 2026]),
              )}
            >
              {formatRangeLabel("Year", yearRange, [1990, 2026])}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <RangeFilter
              label="Year"
              min={1990}
              max={2026}
              value={yearRange}
              onValueChange={setYearRange}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={getTriggerClass(
                isRangeActive(mileageRange, [0, 200000]),
              )}
            >
              {formatRangeLabel("Mileage", mileageRange, [0, 200000], "km")}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <RangeFilter
              label="Mileage"
              min={0}
              max={200000}
              unit="km"
              step={1000}
              value={mileageRange}
              onValueChange={setMileageRange}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={getTriggerClass(
                isRangeActive(priceRange, [0, 100000]),
              )}
            >
              {formatRangeLabel("Price", priceRange, [0, 100000], "CHF")}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <RangeFilter
              label="Price"
              min={0}
              max={150000}
              unit="CHF"
              step={1000}
              value={priceRange}
              onValueChange={setPriceRange}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={getTriggerClass(selectedBodyTypes.length > 0)}
            >
              {selectedBodyTypes.length > 0
                ? `${selectedBodyTypes.length} selected`
                : "Body type"}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <GridFilter
              title="Body Type"
              items={bodyTypes.map((t) => ({ ...t, icon: Car }))}
              selectedValues={selectedBodyTypes}
              onChange={setSelectedBodyTypes}
            />
          </PopoverContent>
        </Popover>

        {/* Fuel */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={getTriggerClass(selectedFuels.length > 0)}
            >
              {selectedFuels.length > 0
                ? `${selectedFuels.length} selected`
                : "Fuel"}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CheckboxListFilter
              title="Fuel Type"
              items={fuelTypes.map((t) => ({
                ...t,
                count: Math.floor(Math.random() * 100),
              }))}
              selectedValues={selectedFuels}
              onChange={setSelectedFuels}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={getTriggerClass(selectedTransmissions.length > 0)}
            >
              {selectedTransmissions.length > 0
                ? `${selectedTransmissions.length} selected`
                : "Transmission"}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CheckboxListFilter
              title="Transmission"
              items={transmissions.map((t) => ({
                ...t,
                count: Math.floor(Math.random() * 50),
              }))}
              selectedValues={selectedTransmissions}
              onChange={setSelectedTransmissions}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={getTriggerClass(selectedDrives.length > 0)}
            >
              {selectedDrives.length > 0
                ? `${selectedDrives.length} selected`
                : "Drive Type"}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CheckboxListFilter
              title="Drive Type"
              items={driveTypes.map((t) => ({
                ...t,
                count: Math.floor(Math.random() * 30),
              }))}
              selectedValues={selectedDrives}
              onChange={setSelectedDrives}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={resetAll}>
          <X /> Reset filters
        </Button>
        <Link href="/advanced-search">
          <Button>
            <CircleEllipsis /> More filters
          </Button>
        </Link>
      </div>
    </div>
  );
}
