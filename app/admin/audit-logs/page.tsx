"use client";

import { useState } from "react";
import { BellRing, BookOpen, Activity, RefreshCcw } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationFilters from "@/components/notifications/NotificationFilters";
import NotificationTable from "@/components/notifications/NotificationTable";
import NotificationPagination from "@/components/notifications/NotificationPagination";
import NotificationDetailModal from "@/components/notifications/NotificationDetailModal";
import type { NotificationFilters as NotificationFilterState } from "@/hooks/useNotifications";

const DEFAULT_FILTERS: NotificationFilterState = {
  page: 1, limit: 50, channel: "", status: "", template: "", search: "", from: "", to: "",
};

type LogTab = "notifications" | "courses" | "activity";

export default function AuditLogsPage() {
  const [activeTab, setActiveTab] = useState<LogTab>("notifications");

  // Notification State
  const [filters, setFilters] = useState<NotificationFilterState>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data, loading, error, meta, refetch } = useNotifications(filters);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10 px-4 sm:px-6 lg:px-8 mt-6">

      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-admin-fg tracking-tight">
            Audit Logs
          </h1>
          <p className="mt-1.5 text-[13px] sm:text-sm text-admin-muted-foreground max-w-2xl">
            Monitor system activity, track content modifications, and verify communication delivery across the platform.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-admin-card border border-admin-border px-4 py-2 text-[13px] font-semibold text-admin-fg hover:bg-admin-muted/5 transition-colors shadow-sm"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Refresh Data
        </button>
      </div>

      {/* Flat Tab Navigation */}
      <div className="border-b border-admin-border/60">
        <nav className="-mb-px flex gap-6 overflow-x-auto hide-scrollbar">
          <TabButton
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
            icon={BellRing}
            label="Notifications"
          />
          <TabButton
            active={activeTab === "courses"}
            onClick={() => setActiveTab("courses")}
            icon={BookOpen}
            label="Course Changes"
          />
          <TabButton
            active={activeTab === "activity"}
            onClick={() => setActiveTab("activity")}
            icon={Activity}
            label="System Activity"
          />
        </nav>
      </div>

      {/* Tab Routing Content */}
      <div className="pt-2">
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <NotificationFilters filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
            <NotificationTable data={data} loading={loading} error={error} onView={setSelectedId} onResetFilters={() => setFilters(DEFAULT_FILTERS)} />
            {meta && <NotificationPagination meta={meta} loading={loading} page={filters.page} onPageChange={(p) => setFilters(c => ({ ...c, page: p }))} />}
          </div>
        )}

        {activeTab === "courses" && <CourseLogsPlaceholder />}
        {activeTab === "activity" && <SystemActivityPlaceholder />}
      </div>

      <NotificationDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}

// --- Helper Components ---

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 py-3 border-b-2 text-[13px] font-medium transition-colors whitespace-nowrap outline-none ${active
          ? "border-admin-primary text-admin-primary"
          : "border-transparent text-admin-muted-foreground hover:text-admin-fg hover:border-admin-border"
        }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// Placeholders for the new log types showing expected structure
function CourseLogsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-admin-border/60 rounded-xl bg-admin-card/30">
      <BookOpen className="h-8 w-8 text-admin-muted-foreground/50 mb-3" />
      <h3 className="text-sm font-semibold text-admin-fg">Course Modification Logs</h3>
      <p className="text-[13px] text-admin-muted-foreground mt-1 max-w-md text-center">
        This table will track Course Names, Actions (Publish/Edit), Performing Admins, and diff changes. Backend endpoint required.
      </p>
    </div>
  );
}

function SystemActivityPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-admin-border/60 rounded-xl bg-admin-card/30">
      <Activity className="h-8 w-8 text-admin-muted-foreground/50 mb-3" />
      <h3 className="text-sm font-semibold text-admin-fg">System Security Activity</h3>
      <p className="text-[13px] text-admin-muted-foreground mt-1 max-w-md text-center">
        This table will log Admin Logins, IP Addresses, Role Changes, and settings modifications. Backend endpoint required.
      </p>
    </div>
  );
}