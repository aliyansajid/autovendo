"use client";

import { MapPin } from "lucide-react";

interface LocationMapProps {
  address: string;
}

export const LocationMap = ({ address }: LocationMapProps) => {
  const encodedAddress = encodeURIComponent(address);

  return (
    <div className="w-full h-[300px] bg-muted rounded-xl overflow-hidden border relative">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodedAddress}`}
        className="grayscale-[0.3] hover:grayscale-0 transition-all duration-500"
      ></iframe>

      <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center text-muted-foreground">
        <MapPin className="w-12 h-12 mb-2 opacity-20" />
        <span className="text-sm font-medium">Map View Placeholder</span>
        <span className="text-xs">(API Key Required)</span>
      </div>
    </div>
  );
};
