"use client";

import { useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { toast } from "sonner";
import { revokeSession, revokeAllSessions } from "@/lib/api/dealers";
import {
  Laptop,
  Tablet,
  Smartphone,
  Globe,
  LogOut,
  Trash2,
} from "lucide-react";

interface Session {
  id: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  impersonatedBy: string | null;
}

interface DealerSessionsProps {
  dealerId: string;
  sessions: Session[];
}

export function DealerSessions({ dealerId, sessions }: DealerSessionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleRevoke = (token: string) => {
    startTransition(async () => {
      const result = await revokeSession(token);
      if (result.success) {
        toast.success("Success");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleRevokeAll = () => {
    startTransition(async () => {
      const result = await revokeAllSessions(dealerId);
      if (result.success) {
        toast.success("Success");
      } else {
        toast.error(result.error);
      }
    });
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Globe className="size-4" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobi")) return <Smartphone className="size-4" />;
    if (ua.includes("tablet")) return <Tablet className="size-4" />;
    return <Laptop className="size-4" />;
  };

  const formatUserAgent = (userAgent: string | null) => {
    if (!userAgent) return "Unknown Browser";
    // Very simple UA parser for display
    if (userAgent.includes("Chrome")) return "Google Chrome";
    if (userAgent.includes("Firefox")) return "Mozilla Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
      return "Apple Safari";
    if (userAgent.includes("Edge")) return "Microsoft Edge";
    return "Web Browser";
  };

  return (
    <div className="space-y-4" id="sessions">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Active Sessions</h3>
        {sessions.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRevokeAll}
            disabled={isPending}
          >
            <Trash2 />
            Revoke All
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No active sessions found.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-full">
                        {getDeviceIcon(session.userAgent)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {formatUserAgent(session.userAgent)}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {session.userAgent || "No device info"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {session.ipAddress || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(session.createdAt).toLocaleString("de-CH", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Active
                      </Badge>
                      {session.impersonatedBy && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-50 text-amber-700 border-amber-200"
                        >
                          Impersonated
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRevoke(session.token)}
                      disabled={isPending}
                    >
                      <LogOut />
                    </Button>
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
