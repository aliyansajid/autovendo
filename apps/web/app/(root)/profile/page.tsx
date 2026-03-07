import { UpdatePasswordForm } from "./_components/update-password-form";
import { SubscriptionCard } from "./_components/subscription-card";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Profile Settings</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <SubscriptionCard />
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
