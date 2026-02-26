"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/src/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/src/components/dialog";
import { ArrowLeft, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface GenericFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: readonly Option[] | Option[];
  selectedValues: string[];
  maxSelections?: number;
  onApply: (values: string[]) => void;
}

export function GenericFilterDialog({
  open,
  onOpenChange,
  title,
  options,
  selectedValues,
  maxSelections = 100, // Default to multi-select, pass 1 for single select
  onApply,
}: GenericFilterDialogProps) {
  const [tempSelected, setTempSelected] = useState<string[]>(selectedValues);

  useEffect(() => {
    if (open) {
      setTempSelected(selectedValues);
    }
  }, [open, selectedValues]);

  const handleToggle = (val: string) => {
    if (tempSelected.includes(val)) {
      setTempSelected(tempSelected.filter((v) => v !== val));
    } else {
      if (maxSelections === 1) {
        setTempSelected([val]);
      } else {
        if (tempSelected.length < maxSelections) {
          setTempSelected([...tempSelected, val]);
        }
      }
    }
  };

  const handleApply = () => {
    onApply(tempSelected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background text-foreground border-border"
      >
        <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-2 text-foreground hover:bg-muted"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          </div>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 hover:bg-transparent px-0 font-normal"
            onClick={() => setTempSelected([])}
          >
            Zurücksetzen
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-1">
            <button
              onClick={() => setTempSelected([])}
              className="w-full flex items-center justify-between py-3 border-b border-border text-left hover:text-primary transition-colors"
            >
              <span>Beliebig</span>
              {tempSelected.length === 0 && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleToggle(opt.value)}
                className="w-full flex items-center justify-between py-3 border-b border-border text-left hover:text-primary transition-colors"
              >
                <span>{opt.label}</span>
                {tempSelected.includes(opt.value) && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-border shrink-0">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg"
            onClick={handleApply}
          >
            Übernehmen{" "}
            {tempSelected.length > 0 ? `(${tempSelected.length})` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
