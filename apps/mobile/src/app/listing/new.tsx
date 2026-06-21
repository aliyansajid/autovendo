import { Redirect } from "expo-router";
import { useSession } from "@/lib/auth-client";
import { VehicleForm } from "@/components/form/vehicle-form";

// Universal "create listing" entry — gates on auth, then the form resolves the
// seller/dealer mode from the user's role.
export default function NewListing() {
  const { data: session, isPending } = useSession();

  if (isPending) return null;
  if (!session) return <Redirect href="/(auth)/login" />;

  return <VehicleForm />;
}
