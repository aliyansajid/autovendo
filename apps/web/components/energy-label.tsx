import React from "react";
import { cn } from "@repo/ui/lib/utils";

interface EnergyLabelProps {
  efficiencyClass: string; // "A", "B", "C", "D", "E", "F", "G"
}

const energyClasses = [
  { label: "A", color: "bg-green-600" },
  { label: "B", color: "bg-green-500" },
  { label: "C", color: "bg-yellow-400" },
  { label: "D", color: "bg-yellow-500" },
  { label: "E", color: "bg-orange-500" },
  { label: "F", color: "bg-orange-600" },
  { label: "G", color: "bg-red-600" },
];

export const EnergyLabel = ({ efficiencyClass }: EnergyLabelProps) => {
  const currentClass = efficiencyClass.toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {energyClasses.map((item) => {
          const isCurrent = item.label === currentClass;
          return (
            <div key={item.label} className="flex items-center gap-4 h-8">
              <div
                className={cn(
                  "flex items-center pl-3 text-white font-bold text-sm h-full relative clip-arrow transition-all duration-300",
                  item.color,
                  isCurrent
                    ? "w-[120px] shadow-md"
                    : "w-[40px] opacity-40 grayscale-[0.5]",
                )}
                style={{
                  clipPath:
                    "polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)",
                  width: isCurrent
                    ? `${40 + energyClasses.indexOf(item) * 10 + 60}px`
                    : `${40 + energyClasses.indexOf(item) * 10}px`,
                }}
              >
                {item.label}
              </div>

              {/* Arrow indicator for current class */}
              {isCurrent && (
                <div className="flex-1 flex items-center animate-in fade-in slide-in-from-left-2 duration-500 delay-100">
                  <div className="h-[1px] bg-black flex-1 mx-2 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent"></div>
                  </div>
                  <div className="text-xl font-bold text-black border-2 border-black rounded px-2 py-0.5">
                    {currentClass}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
