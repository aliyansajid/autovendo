import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge";
import { getImageUrl } from "@/lib/helpers/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/src/components/avatar";
import { DealerListActions } from "./_components/dealer-list-actions";
import { serverFetch } from "@/lib/api/client";

export const dynamic = "force-dynamic";

export default async function DealersPage() {
  const res = await serverFetch("/api/admin/dealers");
  const dealers: any[] = res.ok ? await res.json() : [];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dealers</h2>
        <Button asChild>
          <Link href="/dealers/new">
            <Plus />
            Add Dealer
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No dealers found.
                </TableCell>
              </TableRow>
            ) : (
              dealers.map((dealer) => (
                <TableRow key={dealer.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={getImageUrl(dealer.logo)} />
                      <AvatarFallback>
                        {dealer.companyName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {dealer.companyName}
                  </TableCell>
                  <TableCell>{dealer.contactPerson}</TableCell>
                  <TableCell>{dealer.businessEmail}</TableCell>
                  <TableCell>{dealer.phoneNumber}</TableCell>
                  <TableCell>{dealer.city}</TableCell>
                  <TableCell>
                    {dealer.user?.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge className="bg-green-500 text-white hover:bg-green-600">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {dealer.hasActiveSubscription ? (
                      <Badge className="bg-green-500 text-white hover:bg-green-600">
                        Subscribed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No Subscription</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(dealer.createdAt).toLocaleDateString("de-CH")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DealerListActions
                      dealerId={dealer.id}
                      userId={dealer.userId}
                      isBanned={!!dealer.user?.banned}
                      currentRole={dealer.user?.role || "user"}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
