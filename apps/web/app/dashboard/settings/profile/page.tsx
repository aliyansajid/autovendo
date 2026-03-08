"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import { Input } from "@repo/ui/src/components/input";
import { Label } from "@repo/ui/src/components/label";
import { authClient } from "@repo/auth/client";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Informationen</CardTitle>
        <CardDescription>
          Ihre persönlichen Details und Kontaktinformationen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue={session?.user.name} disabled />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">E-Mail Adresse</Label>
          <Input id="email" defaultValue={session?.user.email} disabled />
        </div>
        <p className="text-xs text-muted-foreground italic">
          * Profiländerungen können derzeit nur über den Administrator
          vorgenommen werden.
        </p>
      </CardContent>
    </Card>
  );
}
