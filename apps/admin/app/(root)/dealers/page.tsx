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

export default async function DealersPage() {
  const dealers = await prisma.dealer.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
              <TableHead>Company</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No dealers found.
                </TableCell>
              </TableRow>
            ) : (
              dealers.map((dealer) => (
                <TableRow key={dealer.id}>
                  <TableCell className="font-medium">
                    {dealer.companyName}
                  </TableCell>
                  <TableCell>{dealer.contactPerson}</TableCell>
                  <TableCell>{dealer.user.email}</TableCell>
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
