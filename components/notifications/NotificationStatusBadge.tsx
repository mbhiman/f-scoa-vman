"use client";

import type { NotificationStatus } from "@/hooks/useNotifications";

const STATUS_STYLES: Record<NotificationStatus, { label: string; className: string }> = {
  SENT: {
    label: "Sent",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
};

export default function NotificationStatusBadge({ status, className = "" }: { status: NotificationStatus, className?: string }) {
  const meta = status in STATUS_STYLES
    ? STATUS_STYLES[status as NotificationStatus]
    : { label: String(status), className: "bg-admin-muted/10 text-admin-muted-foreground" };

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${meta.className} ${className}`}>
      {meta.label}
    </span>
  );
}