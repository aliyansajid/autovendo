"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, ChevronDown, CircleEllipsis, X } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { Checkbox } from "@repo/ui/src/components/checkbox";
import { Slider } from "@repo/ui/src/components/slider";
import {
  MakeModelDialog,
  type MakeModelValue,
} from "@/app/(root)/cars/_components/filters/make-model-dialog";
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
import { TransmissionTypeEnum, DriveTypeEnum } from "@/constants";
import { carBodyTypeEnum, carFuelTypeEnum } from "@/constants/cars";

import { FieldLabel } from "@repo/ui/src/components/field";

// Utility for classes
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  unit?: string;
  step?: number;
  value: [number, number];
  onValueChange: (val: [number, number]) => void;
}

function RangeFilter({
  label,
  min,
  max,
  unit,
  step = 1,
  value,
  onValueChange,
}: RangeFilterProps) {
  return (
    <div className="space-y-4">
      <PopoverHeader>
        <PopoverTitle className="text-base font-semibold">{label}</PopoverTitle>
        <PopoverDescription
          className="text-xs cursor-pointer hover:underline"
          onClick={() => onValueChange([min, max])}
        >
          Reset
        </PopoverDescription>
      </PopoverHeader>

      <div className="pt-2">
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          onValueChange={(val) => onValueChange(val as [number, number])}
          className="py-2"
        />
      </div>

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
    <div className="space-y-4">
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
              <FieldLabel htmlFor={`${title}-${item.value}`}>
                {item.label}
              </FieldLabel>
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
    <div className="space-y-4">
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
            <FieldLabel htmlFor={`grid-${title}-${item.value}`}>
              {item.label}
            </FieldLabel>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useMemo } from "react";
import type { VehicleSearchParams } from "@/lib/schemas/vehicle.schema";
import type { VehicleFacets } from "@/types";

interface GarageRichFiltersProps {
  onFilterChange: (filters: Partial<VehicleSearchParams>) => void;
  dealerId?: string;
  initialFilters?: Partial<VehicleSearchParams>;
  facets?: VehicleFacets | null;
}

const DEFAULTS = {
  YEAR: [1900, 2026] as [number, number],
  KILOMETER: [0, 200000] as [number, number],
  PRICE: [0, 100000] as [number, number],
};

export default function GarageRichFilters({
  onFilterChange,
  dealerId,
  initialFilters = {},
  facets,
}: GarageRichFiltersProps) {
  const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);

  // Filter States
  const [selectedMakes, setSelectedMakes] = useState<string[]>(
    initialFilters.make || [],
  );
  const [excludedMakes, setExcludedMakes] = useState<string[]>(
    initialFilters.excludeMake || [],
  );
  const [selectedModels, setSelectedModels] = useState<string[]>(
    initialFilters.model || [],
  );
  const [yearRange, setYearRange] = useState<[number, number] | null>(
    initialFilters.registrationFrom || initialFilters.registrationTo
      ? [
          initialFilters.registrationFrom || DEFAULTS.YEAR[0],
          initialFilters.registrationTo || DEFAULTS.YEAR[1],
        ]
      : null,
  );
  const [kilometerRange, setKilometerRange] = useState<[number, number] | null>(
    initialFilters.kilometerFrom || initialFilters.kilometerTo
      ? [
          initialFilters.kilometerFrom || DEFAULTS.KILOMETER[0],
          initialFilters.kilometerTo || DEFAULTS.KILOMETER[1],
        ]
      : null,
  );
  const [priceRange, setPriceRange] = useState<[number, number] | null>(
    initialFilters.priceFrom || initialFilters.priceTo
      ? [
          initialFilters.priceFrom || DEFAULTS.PRICE[0],
          initialFilters.priceTo || DEFAULTS.PRICE[1],
        ]
      : null,
  );
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>(
    (initialFilters.bodyType as string[]) || [],
  );
  const [selectedFuels, setSelectedFuels] = useState<string[]>(
    (initialFilters.fuel as string[]) || [],
  );
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>(
    (initialFilters.transmission as string[]) || [],
  );
  const [selectedDrives, setSelectedDrives] = useState<string[]>(
    (initialFilters.driveType as string[]) || [],
  );

  // Debounce and Notify
  const filterValues = useMemo(() => {
    // Preserve ALL initial filters initially (especially unmanaged ones like vehicleType, condition)
    const filters: Partial<VehicleSearchParams> = { ...initialFilters };

    // Overwrite with local UI state. 
    // If local state is empty/null, we explicitly clear those keys to allow user to "reset" via this UI.
    
    // Make & Model
    if (selectedMakes.length > 0) {
      filters.make = selectedMakes;
    } else {
      delete filters.make;
    }

    if (excludedMakes.length > 0) {
      filters.excludeMake = excludedMakes;
    } else {
      delete filters.excludeMake;
    }

    if (selectedModels.length > 0) {
      filters.model = selectedModels;
    } else {
      delete filters.model;
    }

    // Year
    if (yearRange) {
      filters.registrationFrom = yearRange[0];
      filters.registrationTo = yearRange[1];
    } else {
      delete filters.registrationFrom;
      delete filters.registrationTo;
    }

    // Kilometer
    if (kilometerRange) {
      filters.kilometerFrom = kilometerRange[0];
      if (kilometerRange[1] !== DEFAULTS.KILOMETER[1]) {
        filters.kilometerTo = kilometerRange[1];
      } else {
        delete filters.kilometerTo;
      }
    } else {
      delete filters.kilometerFrom;
      delete filters.kilometerTo;
    }

    // Price
    if (priceRange) {
      filters.priceFrom = priceRange[0];
      if (priceRange[1] !== DEFAULTS.PRICE[1]) {
        filters.priceTo = priceRange[1];
      } else {
        delete filters.priceTo;
      }
    } else {
      delete filters.priceFrom;
      delete filters.priceTo;
    }

    // Multi-selects
    if (selectedBodyTypes.length > 0) {
      filters.bodyType = selectedBodyTypes as any;
    } else {
      delete filters.bodyType;
    }

    if (selectedFuels.length > 0) {
      filters.fuel = selectedFuels as any;
    } else {
      delete filters.fuel;
    }

    if (selectedTransmissions.length > 0) {
      filters.transmission = selectedTransmissions as any;
    } else {
      delete filters.transmission;
    }

    if (selectedDrives.length > 0) {
      filters.driveType = selectedDrives;
    } else {
      delete filters.driveType;
    }

    return filters;
  }, [
    initialFilters,
    selectedMakes,
    excludedMakes,
    selectedModels,
    yearRange,
    kilometerRange,
    priceRange,
    selectedBodyTypes,
    selectedFuels,
    selectedTransmissions,
    selectedDrives,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filterValues);
    }, 400);
    return () => clearTimeout(timer);
  }, [filterValues, onFilterChange]);

  const handleMakeModelChange = (v: MakeModelValue) => {
    setSelectedMakes(v.includes);
    setExcludedMakes(v.excludes);
    setSelectedModels(v.models);
  };

  const resetAll = () => {
    setSelectedMakes([]);
    setExcludedMakes([]);
    setSelectedModels([]);
    setYearRange(null);
    setKilometerRange(null);
    setPriceRange(null);
    setSelectedBodyTypes([]);
    setSelectedFuels([]);
    setSelectedTransmissions([]);
    setSelectedDrives([]);
  };

  const formatRangeLabel = (
    label: string,
    current: [number, number] | null,
    def: [number, number],
    unit = "",
    noPlus = false,
  ) => {
    if (!current) return label;
    const [cMin, cMax] = current;
    const [dMin, dMax] = def;

    const minStr = cMin.toLocaleString("de-CH");
    const maxStr = cMax.toLocaleString("de-CH");

    if (noPlus) {
      return `${minStr} - ${maxStr}${unit}`;
    }

    if (cMax === dMax) {
      return `${minStr} - ${maxStr}${unit}+`;
    }

    return `${minStr} - ${maxStr}${unit}`;
  };

  const isRangeActive = (current: [number, number] | null) => {
    return current !== null;
  };

  const getTriggerClass = (isActive: boolean) =>
    cn(
      "w-full justify-between font-normal text-muted-foreground transition-all duration-200",
      isActive &&
        "text-primary border-primary/20 bg-primary/5 font-medium shadow-xs",
    );

    const totalSelected = selectedMakes.length + excludedMakes.length;
    const label =
      totalSelected > 0
        ? `${totalSelected} Marken/Modelle`
        : "Marke & Modell";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          variant="outline"
          onClick={() => setIsMakeModalOpen(true)}
          className={getTriggerClass(
            selectedMakes.length > 0 || excludedMakes.length > 0,
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        <MakeModelDialog
          open={isMakeModalOpen}
          onOpenChange={setIsMakeModalOpen}
          value={{
            includes: selectedMakes,
            excludes: excludedMakes,
            models: selectedModels,
          }}
          onChange={handleMakeModelChange}
          makeCounts={facets?.make}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={getTriggerClass(isRangeActive(yearRange))}
            >
              {formatRangeLabel("Jahr", yearRange, DEFAULTS.YEAR, "", true)}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[300px]">
            <RangeFilter
              label="Jahr"
              min={1900}
              max={2026}
              value={yearRange ?? DEFAULTS.YEAR}
              onValueChange={setYearRange}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={getTriggerClass(isRangeActive(kilometerRange))}
            >
              {formatRangeLabel(
                "Kilometerstand",
                kilometerRange,
                DEFAULTS.KILOMETER,
                " km",
              )}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[300px]">
            <RangeFilter
              label="Kilometerstand"
              min={0}
              max={200000}
              unit="km"
              step={1000}
              value={kilometerRange ?? DEFAULTS.KILOMETER}
              onValueChange={setKilometerRange}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={getTriggerClass(isRangeActive(priceRange))}
            >
              {formatRangeLabel("Preis", priceRange, DEFAULTS.PRICE, " CHF")}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[300px]">
            <RangeFilter
              label="Preis"
              min={0}
              max={100000}
              unit="CHF"
              step={1000}
              value={priceRange ?? DEFAULTS.PRICE}
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
                ? `${selectedBodyTypes.length} ausgewählt`
                : "Karosserieform"}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px]" align="start">
            <CheckboxListFilter
              title="Karosserieform"
              items={carBodyTypeEnum.map(
                (t: { value: string; label: string }) => ({ ...t, icon: Car }),
              )}
              selectedValues={selectedBodyTypes}
              onChange={setSelectedBodyTypes}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={getTriggerClass(selectedFuels.length > 0)}
            >
              {selectedFuels.length > 0
                ? `${selectedFuels.length} ausgewählt`
                : "Treibstoff"}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[300px]">
            <CheckboxListFilter
              title="Treibstoff"
              items={carFuelTypeEnum.map(
                (t: { value: string; label: string }) => ({
                  ...t,
                }),
              )}
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
                ? `${selectedTransmissions.length} ausgewählt`
                : "Getriebe"}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[300px]">
            <CheckboxListFilter
              title="Getriebe"
              items={TransmissionTypeEnum.map((t) => ({
                ...t,
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
                ? `${selectedDrives.length} ausgewählt`
                : "Antrieb"}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[300px]">
            <CheckboxListFilter
              title="Antrieb"
              items={DriveTypeEnum.map((t) => ({
                ...t,
              }))}
              selectedValues={selectedDrives}
              onChange={setSelectedDrives}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-end gap-3">
        {(selectedMakes.length > 0 ||
          isRangeActive(yearRange) ||
          isRangeActive(kilometerRange) ||
          isRangeActive(priceRange) ||
          selectedBodyTypes.length > 0 ||
          selectedFuels.length > 0 ||
          selectedTransmissions.length > 0 ||
          selectedDrives.length > 0) && (
          <Button
            variant="ghost"
            onClick={resetAll}
            className="text-muted-foreground hover:text-foreground"
          >
            <X />
            Filter zurücksetzen
          </Button>
        )}
        <Link href={dealerId ? `/advanced-search?dealer=${dealerId}` : "/advanced-search"}>
          <Button variant="secondary">
            <CircleEllipsis />
            Mehr Filter
          </Button>
        </Link>
      </div>
    </div>
  );
}
