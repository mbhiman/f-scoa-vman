"use client";

import { Eye, Mail, MessageCircle, Smartphone } from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";
import NotificationStatusBadge from "./NotificationStatusBadge";

const channelIcons = {
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  SMS: Smartphone,
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
};

export default function NotificationMobileCard({ item, onView }: { item: Notification; onView: (id: number) => void }) {
  const ChannelIcon = channelIcons[item.channel];
  const title = item.subject ?? item.jobName ?? "No subject";

  return (
    <article className="p-4 bg-admin-card transition-colors active:bg-admin-muted/5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-primary/10 text-admin-primary">
            <ChannelIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-[13px] text-admin-fg">
              {item.recipient}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-admin-muted-foreground">
              {title}
            </p>
          </div>
        </div>
        <NotificationStatusBadge status={item.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
        <div className="flex flex-col">
          <span className="text-admin-muted-foreground font-medium">Channel</span>
          <span className="font-semibold text-admin-fg">{item.channel}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-admin-muted-foreground font-medium">Template</span>
          <span className="font-semibold text-admin-fg capitalize">{item.template}</span>
        </div>
        <div className="col-span-2 flex flex-col mt-1">
          <span className="text-admin-muted-foreground font-medium">Sent At</span>
          <span className="font-semibold text-admin-fg">{formatDate(item.sentAt ?? item.createdAt)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onView(item.id)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-admin-border/60 bg-admin-bg/50 px-4 py-2 text-[12px] font-semibold text-admin-fg transition-colors active:bg-admin-muted/10"
      >
        <Eye className="h-3.5 w-3.5" /> View Full Details
      </button>
    </article>
  );
}