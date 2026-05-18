"use client";

import { Eye, Mail, MessageCircle, Smartphone } from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";
import NotificationStatusBadge from "./NotificationStatusBadge";

type Props = {
  item: Notification;
  onView: (id: number) => void;
};

const channelIcons = {
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  SMS: Smartphone,
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not sent";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit"
  });
};

export default function NotificationRow({ item, onView }: Props) {
  const ChannelIcon = channelIcons[item.channel];

  return (
    <tr className="border-b border-admin-border/40 transition-colors last:border-0 hover:bg-admin-muted/5 group">
      <td className="px-4 py-3.5 align-middle">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-admin-primary/10 text-admin-primary">
            <ChannelIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-admin-fg text-[13px]">{item.channel}</p>
            <p className="truncate text-[11px] text-admin-muted-foreground">
              {item.provider ?? "Provider pending"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5 align-middle">
        <span className="bg-admin-bg border border-admin-border/60 text-admin-fg text-[11px] px-2 py-1 rounded font-medium capitalize">
          {item.template}
        </span>
      </td>

      <td className="px-4 py-3.5 align-middle max-w-50 xl:max-w-75">
        <p className="truncate font-medium text-admin-fg text-[13px]">{item.recipient}</p>
        <p className="truncate text-[11px] text-admin-muted-foreground">{item.subject ?? item.jobName ?? "No subject"}</p>
      </td>

      <td className="px-4 py-3.5 align-middle">
        <NotificationStatusBadge status={item.status} />
      </td>

      <td className="whitespace-nowrap px-4 py-3.5 align-middle text-[12px] text-admin-muted-foreground">
        {formatDate(item.sentAt ?? item.createdAt)}
      </td>

      <td className="px-4 py-3.5 text-right align-middle">
        <button
          type="button"
          onClick={() => onView(item.id)}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-admin-primary hover:text-admin-primary-hover transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <Eye className="h-3.5 w-3.5" /> Details
        </button>
      </td>
    </tr>
  );
}