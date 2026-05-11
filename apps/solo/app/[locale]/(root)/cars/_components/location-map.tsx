"use client";

interface LocationMapProps {
  address: string;
}

export const LocationMap = ({ address }: LocationMapProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const encodedAddress = encodeURIComponent(address);

  if (!apiKey) return null;

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`}
      />
    </div>
  );
};
