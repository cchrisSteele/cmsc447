export const FACILITY_LAYERS = [
  { id: "construction", label: "Construction Zones", icon: "🚧" },
  { id: "buildings", label: "Buildings", icon: "🏢" },
  { id: "parking", label: "Parking Lots", icon: "🅿️" },
] as const;

export type FacilityLayerId = (typeof FACILITY_LAYERS)[number]["id"];

export type PinLocation = {
  latitude: number;
  longitude: number;
};

export type FacilityPin = PinLocation & {
  id: string;
  layerId: FacilityLayerId;
  name: string;
  description: string;
};
