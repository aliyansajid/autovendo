import { getSellerProfile } from "@/app/actions/dealer.actions";
import { SellerProfileForm } from "@/app/[locale]/dashboard/settings/_components/seller-profile-form";
import { getTranslations } from "next-intl/server";

export default async function ProfilePage() {
  const t = await getTranslations("ProfilePage");

  const sellerProfile = await getSellerProfile();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <SellerProfileForm initialData={sellerProfile} />
    </div>
  );
}
