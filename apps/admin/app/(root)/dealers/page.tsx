import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { getImageUrl } from "@/lib/helpers/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/src/components/avatar";

export const dynamic = "force-dynamic";

interface DealerListItem {
  id: string;
  logo: string | null;
  companyName: string;
  contactPerson: string;
  businessEmail: string;
  phoneNumber: string;
  city: string;
  createdAt: Date;
}

export default async function DealersPage() {
  const dealers = (await prisma.dealer.findMany({
    select: {
      id: true,
      logo: true,
      companyName: true,
      contactPerson: true,
      businessEmail: true,
      phoneNumber: true,
      city: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as DealerListItem[];

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
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
                    {new Date(dealer.createdAt).toLocaleDateString()}
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
