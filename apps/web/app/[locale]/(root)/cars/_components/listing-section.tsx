import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";

interface ListingSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ListingSection({ title, children }: ListingSectionProps) {
  return (
    <Card>
      <CardHeader className="border-b gap-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
