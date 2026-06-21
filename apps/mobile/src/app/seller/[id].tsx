import { useLocalSearchParams } from "expo-router";
import { VehicleForm } from "@/components/form/vehicle-form";

export default function SellerEditListing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <VehicleForm mode="seller" vehicleId={id} />;
}
