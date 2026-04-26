import { getTranslations } from "next-intl/server";
import { UpdatePasswordForm } from "../../_components/update-password-form";

export default async function ChangePasswordPage() {
  const t = await getTranslations("ChangePasswordPage");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <UpdatePasswordForm />
    </div>
  );
}
