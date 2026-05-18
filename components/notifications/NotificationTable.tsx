"use client";

import { AlertTriangle, Inbox, RotateCcw } from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";
import NotificationRow from "./NotificationRow";
import NotificationMobileCard from "./NotificationMobileCard";

export default function NotificationTable({ data, loading, error, onView, onResetFilters }: any) {

  if (loading) {
    return (
      <div className="bg-admin-card border border-admin-border/60 rounded-xl p-8 flex items-center justify-center min-h-75 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-admin-muted-foreground">
          <div className="h-5 w-5 border-2 border-admin-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px]">Loading logs...</p>
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="bg-admin-card border border-admin-border/60 rounded-xl p-8 flex flex-col items-center justify-center min-h-75 shadow-sm">
        <Inbox className="h-10 w-10 text-admin-muted-foreground/30 mb-3" />
        <h3 className="text-sm font-semibold text-admin-fg mb-1">
          {error ? "Unable to load logs" : "No logs found"}
        </h3>
        <p className="text-[13px] text-admin-muted-foreground mb-4">
          {error || "Try adjusting your filters to find what you're looking for."}
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="text-[12px] font-medium text-admin-primary bg-admin-primary/10 hover:bg-admin-primary/20 px-3 py-1.5 rounded-md transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-admin-card rounded-xl border border-admin-border/60 shadow-sm overflow-hidden">

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-admin-border/40">
        {data.map((item: Notification) => (
          <NotificationMobileCard key={item.id} item={item} onView={onView} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-admin-bg/50 border-b border-admin-border/60 text-[11px] font-semibold uppercase tracking-wider text-admin-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium">Recipient</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border/40">
            {data.map((item: Notification) => (
              <NotificationRow key={item.id} item={item} onView={onView} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}