import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { getDealerProfile } from "@/app/actions/dealer.actions";
import { DealerProfileForm } from "@/app/[locale]/dashboard/_components/dealer-profile-form";
import { getTranslations } from "next-intl/server";

export default async function ProfilePage() {
  const t = await getTranslations("ProfilePage");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const dealerProfile = await getDealerProfile(session!.user.id);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <DealerProfileForm initialData={dealerProfile} />
    </div>
  );
}
