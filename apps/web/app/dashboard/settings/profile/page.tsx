import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { getDealerProfile } from "../../../actions/dealer.actions";
import { DealerProfileForm } from "../../_components/dealer-profile-form";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) unauthorized();

  const dealerProfile = await getDealerProfile(session.user.id);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal and dealer account information.
        </p>
      </div>
      <DealerProfileForm initialData={dealerProfile} />
    </div>
  );
}
