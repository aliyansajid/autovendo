import { useLocalSearchParams } from "expo-router";
import { VehicleForm } from "@/components/form/vehicle-form";

export default function DealerEditListing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <VehicleForm mode="dealer" vehicleId={id} />;
}
