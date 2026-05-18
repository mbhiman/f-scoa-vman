"use client";

import { Eye, Mail, MessageCircle, Smartphone, Clock } from "lucide-react";
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
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
};

export default function NotificationMobileCard({ item, onView }: { item: Notification; onView: (id: number) => void }) {
  const ChannelIcon = channelIcons[item.channel] || Mail;
  const title = item.subject ?? item.jobName ?? "No subject";

  return (
    <article className="py-4 px-1 border-b border-admin-border/40 last:border-0 active:bg-admin-muted/5 transition-colors">

      {/* Header Row: Channel Icon, Recipient, Status */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-admin-bg border border-admin-border/60 text-admin-primary">
            <ChannelIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[13px] text-admin-fg">
              {item.recipient}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-admin-muted-foreground font-medium">
              <span className="uppercase tracking-wider">{item.template}</span>
            </div>
          </div>
        </div>
        <NotificationStatusBadge status={item.status} />
      </div>

      {/* Subject/Title */}
      <div className="pl-11 pr-2 mb-3">
        <p className="text-[12px] text-admin-muted-foreground line-clamp-2 leading-relaxed">
          {title}
        </p>
      </div>

      {/* Footer Row: Date & Action Link */}
      <div className="pl-11 pr-2 flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-admin-muted-foreground font-medium">
          <Clock className="w-3 h-3" />
          {formatDate(item.sentAt ?? item.createdAt)}
        </div>

        <button
          type="button"
          onClick={() => onView(item.id)}
          className="flex items-center gap-1 text-[11px] font-bold text-admin-primary uppercase tracking-wider"
        >
          Details <Eye className="w-3 h-3 ml-0.5" />
        </button>
      </div>
    </article>
  );
}