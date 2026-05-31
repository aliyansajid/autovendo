export const truckMakes = [
  {
    label: "Top-Marken",
    items: [
      { value: "DAF", label: "DAF" },
      { value: "FORD_TRUCKS", label: "Ford Trucks" },
      { value: "IVECO", label: "Iveco" },
      { value: "MAN", label: "MAN" },
      { value: "MERCEDES_BENZ", label: "Mercedes-Benz" },
      { value: "RENAULT", label: "Renault" },
      { value: "SCANIA", label: "Scania" },
      { value: "VOLVO", label: "Volvo" },
    ],
  },
  {
    label: "Alle Marken",
    items: [
      { value: "ADDAX_MOTORS", label: "Addax Motors" },
      { value: "AEC", label: "AEC" },
      { value: "BERLIET", label: "Berliet" },
      { value: "BERNA", label: "Berna" },
      { value: "BOVA", label: "Bova" },
      { value: "BUCHER", label: "Bucher" },
      { value: "BYD", label: "BYD" },
      { value: "CENNTRO", label: "Cenntro" },
      { value: "FBW", label: "FBW" },
      { value: "FENDT", label: "Fendt" },
      { value: "FORD", label: "Ford" },
      { value: "FRESIA", label: "Fresia" },
      { value: "FUSO", label: "Fuso" },
      { value: "GROVE", label: "Grove" },
      { value: "HANOMAG", label: "Hanomag" },
      { value: "HENSCHEL", label: "Henschel" },
      { value: "IVECO_MAGIRUS", label: "Iveco (Magirus)" },
      { value: "KAESSBOHRER", label: "Kaessbohrer" },
      { value: "KOMMOBIL_UNIMOG", label: "Kommobil (Unimog)" },
      { value: "MAN_VW", label: "MAN - VW" },
      { value: "MITSUBISHI", label: "Mitsubishi" },
      { value: "NAW", label: "NAW" },
      { value: "NISSAN", label: "Nissan" },
      { value: "OM", label: "OM" },
      { value: "SANTANA", label: "Santana" },
      { value: "SAURER", label: "Saurer" },
      { value: "SETRA", label: "Setra" },
      { value: "SOR", label: "SOR" },
      { value: "STEYR", label: "Steyr" },
      { value: "TATRA", label: "Tatra" },
      { value: "TEMPO", label: "Tempo" },
      { value: "TEMSA", label: "Temsa" },
      { value: "TOYOTA", label: "Toyota" },
      { value: "UNIMOG", label: "Unimog" },
      { value: "VAN_HOOL", label: "Van Hool" },
      { value: "VDL", label: "VDL" },
      { value: "VW", label: "VW" },
      { value: "ZETTELMEYER", label: "Zettelmeyer" },
    ],
  },
] as const;

export const truckModels: Record<string, { value: string; label: string }[]> = {
  BYD: [
    { value: "ETH8", label: "ETH8" },
    { value: "ETM6", label: "ETM6" },
  ],
  FENDT: [{ value: "XYLON", label: "Xylon" }],
  FORD_TRUCKS: [{ value: "F_MAX", label: "F-MAX" }],
  IVECO: [
    { value: "35", label: "35" },
    { value: "49", label: "49" },
    { value: "50", label: "50" },
    { value: "75", label: "75" },
    { value: "EUROCARGO", label: "EUROCARGO" },
    { value: "MAGIRUS", label: "Magirus" },
  ],
  KAESSBOHRER: [
    { value: "RATRAC_RC", label: "RATRAC RC" },
    { value: "SETRA_S9A", label: "SETRA S9A" },
  ],
  NISSAN: [
    { value: "ATLEON", label: "ATLEON" },
    { value: "NT500", label: "NT500" },
  ],
  SOR: [{ value: "EBN_8", label: "EBN 8" }],
  VW: [
    { value: "CRAFTER", label: "CRAFTER" },
    { value: "T4", label: "T4" },
  ],
};

export const truckBodyTypeEnum = [
  { value: "BRIDGE", label: "Brücke" },
  { value: "CHASSIS_CAB", label: "Chassis Kabine" },
  { value: "CAB_OVER", label: "Doppelkabine" },
  { value: "BOX", label: "Kasten" },
  { value: "TIPPER", label: "Kipper" },
  { value: "COACH", label: "Reisebus" },
  { value: "SEMI_TRAILER", label: "Sattel-Auflieger" },
] as const;

export const truckFuelTypeEnum = [
  { value: "PETROL", label: "Benzin" },
  { value: "DIESEL", label: "Diesel" },
  { value: "ELECTRIC", label: "Elektro" },
] as const;

export const truckExtrasEnum = [
  { value: "DIRECT_IMPORT", label: "Direkt-/Parallelimport" },
  { value: "ACCIDENT_VEHICLE", label: "Unfallfahrzeug" },
  { value: "TARPAULIN", label: "Blache/Plane" },
  { value: "TAIL_LIFT", label: "Hebebühne" },
] as const;
