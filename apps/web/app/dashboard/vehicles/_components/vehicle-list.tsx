"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/src/components/table";
import { Button } from "@repo/ui/src/components/button";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { deleteVehicle } from "@/app/actions/vehicle-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@repo/ui/src/components/input-group";

interface Vehicle {
  id: string;
  make: string;
  model: string | null;
  version: string | null;
  price: number;
  kilometer: number;
  registrationMonth: number;
  registrationYear: number;
  images: string[];
  createdAt: Date;
}

export function VehicleList({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVehicles = useMemo(() => {
    if (!searchQuery) return vehicles;
    const query = searchQuery.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.make.toLowerCase().includes(query) ||
        (v.model?.toLowerCase() || "").includes(query) ||
        (v.version?.toLowerCase() || "").includes(query),
    );
  }, [vehicles, searchQuery]);

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/20">
        <h3 className="text-lg font-semibold">Keine Fahrzeuge gefunden</h3>
        <p className="text-muted-foreground mb-6">
          Sie haben noch keine Fahrzeuge inseriert.
        </p>
        <Button asChild>
          <Link href="/dashboard/vehicles/new">Neues Inserat erstellen</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InputGroup className="sm:max-w-sm">
        <InputGroupInput
          placeholder="Nach Marke, Modell oder Version suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Bild</TableHead>
              <TableHead>Fahrzeug</TableHead>
              <TableHead>Preis</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Erstellt am</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                    {vehicle.images?.[0] ? (
                      <Image
                        src={
                          vehicle.images[0].startsWith("http")
                            ? vehicle.images[0]
                            : `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || ""}/${vehicle.images[0]}`
                        }
                        alt={`${vehicle.make} ${vehicle.model}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {vehicle.make}&nbsp;{vehicle.model}
                </TableCell>
                <TableCell className="font-semibold">
                  CHF {vehicle.price.toLocaleString("de-CH")}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5 text-muted-foreground">
                    <div>{vehicle.kilometer.toLocaleString("de-CH")} km</div>
                    <div>
                      {vehicle.registrationMonth}/{vehicle.registrationYear}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(vehicle.createdAt), "dd.MM.yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                        <Edit />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Inserat wirklich löschen?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Diese Aktion kann nicht rückgängig gemacht werden.
                            Das Inserat wird dauerhaft aus unserer Datenbank
                            gelöscht.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={async () => {
                              try {
                                await deleteVehicle(vehicle.id);
                                toast.success("Inserat erfolgreich gelöscht!");
                                router.refresh();
                              } catch (error) {
                                toast.error(
                                  "Fehler beim Löschen des Inserats.",
                                );
                              }
                            }}
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
