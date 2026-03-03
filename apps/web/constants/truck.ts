export const truckMakes = [
  {
    label: "Top-Marken",
    items: [
      { value: "daf", label: "DAF" },
      { value: "ford-trucks", label: "Ford Trucks" },
      { value: "iveco", label: "Iveco" },
      { value: "man", label: "MAN" },
      { value: "mercedes-benz", label: "Mercedes-Benz" },
      { value: "renault", label: "Renault" },
      { value: "scania", label: "Scania" },
      { value: "volvo", label: "Volvo" },
    ],
  },
  {
    label: "Alle Marken",
    items: [
      { value: "addax-motors", label: "Addax Motors" },
      { value: "aec", label: "AEC" },
      { value: "berliet", label: "Berliet" },
      { value: "berna", label: "Berna" },
      { value: "bova", label: "Bova" },
      { value: "bucher", label: "Bucher" },
      { value: "byd", label: "BYD" },
      { value: "cenntro", label: "Cenntro" },
      { value: "fbw", label: "FBW" },
      { value: "fendt", label: "Fendt" },
      { value: "ford", label: "Ford" },
      { value: "fresia", label: "Fresia" },
      { value: "fuso", label: "Fuso" },
      { value: "grove", label: "Grove" },
      { value: "hanomag", label: "Hanomag" },
      { value: "henschel", label: "Henschel" },
      { value: "iveco-magirus", label: "Iveco (Magirus)" },
      { value: "kaessbohrer", label: "Kaessbohrer" },
      { value: "kommobil-unimog", label: "Kommobil (Unimog)" },
      { value: "man-vw", label: "MAN - VW" },
      { value: "mitsubishi", label: "Mitsubishi" },
      { value: "naw", label: "NAW" },
      { value: "nissan", label: "Nissan" },
      { value: "om", label: "OM" },
      { value: "santana", label: "Santana" },
      { value: "saurer", label: "Saurer" },
      { value: "setra", label: "Setra" },
      { value: "sor", label: "SOR" },
      { value: "steyr", label: "Steyr" },
      { value: "tatra", label: "Tatra" },
      { value: "tempo", label: "Tempo" },
      { value: "temsa", label: "Temsa" },
      { value: "toyota", label: "Toyota" },
      { value: "unimog", label: "Unimog" },
      { value: "van-hool", label: "Van Hool" },
      { value: "vdl", label: "VDL" },
      { value: "vw", label: "VW" },
      { value: "zettelmeyer", label: "Zettelmeyer" },
    ],
  },
] as const;

export const truckModels: Record<string, { value: string; label: string }[]> = {
  byd: [
    { value: "eth8", label: "ETH8" },
    { value: "etm6", label: "ETM6" },
  ],
  fendt: [{ value: "xylon", label: "Xylon" }],
  "ford-trucks": [{ value: "f-max", label: "F-MAX" }],
  iveco: [
    { value: "35", label: "35" },
    { value: "49", label: "49" },
    { value: "50", label: "50" },
    { value: "75", label: "75" },
    { value: "eurocargo", label: "EUROCARGO" },
    { value: "magirus", label: "Magirus" },
  ],
  kaessbohrer: [
    { value: "ratrac-rc", label: "RATRAC RC" },
    { value: "setra-s9a", label: "SETRA S9A" },
  ],
  nissan: [
    { value: "atleon", label: "ATLEON" },
    { value: "nt500", label: "NT500" },
  ],
  sor: [{ value: "ebn-8", label: "EBN 8" }],
  vw: [
    { value: "crafter", label: "CRAFTER" },
    { value: "t4", label: "T4" },
  ],
};

export const truckBodyTypeEnum = [
  { value: "bridge", label: "Brücke" },
  { value: "chassis-cab", label: "Chassis Kabine" },
  { value: "cab-over", label: "Doppelkabine" },
  { value: "box", label: "Kasten" },
  { value: "tipper", label: "Kipper" },
  { value: "car", label: "Reisebus" },
  { value: "semi-trailer", label: "Sattel-Auflieger" },
] as const;

export const truckFuelTypeEnum = [
  { value: "petrol", label: "Benzin" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Elektro" },
] as const;

export const truckExtrasEnum = [
  { value: "direct-import", label: "Direkt-/Parallelimport" },
  { value: "accident-vehicle", label: "Unfallfahrzeug" },
  { value: "tarpaulin", label: "Blache/Plane" },
  { value: "tail-lift", label: "Hebebühne" },
] as const;
