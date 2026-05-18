"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type { NotificationFilters as NotificationFilterState } from "@/hooks/useNotifications";

type Props = {
  filters: NotificationFilterState;
  onChange: (filters: NotificationFilterState) => void;
  onReset: () => void;
};

// Flat, minimal input class
const inputClass = "h-[38px] w-full rounded-lg border border-admin-border bg-admin-bg/50 px-3 text-[13px] text-admin-fg outline-none transition-all placeholder:text-admin-muted-foreground focus:border-admin-primary/50 focus:bg-admin-card focus:ring-2 focus:ring-admin-primary/10";

type SelectOption<T extends string> = { value: T | ""; label: string };

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-semibold text-admin-fg">
      {children}
    </span>
  );
}

// Keeping the beautiful dropdown animation as requested
function ModernSelect<T extends string>({ value, onChange, options, placeholder, ariaLabel }: any) {
  const buttonId = useId();
  const listboxId = useMemo(() => `listbox-${buttonId}`, [buttonId]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = options.find((o: any) => o.value === value)?.label ?? (value ? String(value) : placeholder);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={buttonId}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`${inputClass} group inline-flex items-center justify-between gap-3 px-3 text-left hover:border-admin-primary/40`}
      >
        <span className={`min-w-0 flex-1 truncate ${value ? "text-admin-fg" : "text-admin-muted-foreground"}`}>
          {selectedLabel}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-admin-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key={listboxId}
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-lg border border-admin-border bg-admin-card shadow-lg"
          >
            <div className="max-h-64 overflow-auto p-1">
              <div className="flex flex-col">
                {options.map((option: any) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value || "__all"}
                      type="button"
                      onClick={() => { onChange(option.value); setOpen(false); }}
                      className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-[13px] transition-colors ${isSelected
                        ? "bg-admin-primary/10 text-admin-primary font-medium"
                        : "text-admin-fg hover:bg-admin-muted/5"
                        }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NotificationFilters({ filters, onChange, onReset }: Props) {
  const updateFilter = (key: keyof NotificationFilterState, value: string | number) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <section className="bg-admin-card rounded-xl border border-admin-border/60 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Search */}
          <div className="lg:col-span-1">
            <FieldLabel>Search Recipient</FieldLabel>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-muted-foreground" />
              <input
                type="text"
                value={filters.search ?? ""}
                placeholder="Email or phone..."
                className={`${inputClass} pl-8`}
                onChange={(e) => updateFilter("search", e.target.value)}
              />
            </div>
          </div>

          {/* Channel */}
          <div>
            <FieldLabel>Channel</FieldLabel>
            <ModernSelect
              ariaLabel="Channel filter"
              placeholder="All channels"
              value={(filters.channel ?? "") as "" | "EMAIL" | "WHATSAPP" | "SMS"}
              onChange={(v: any) => updateFilter("channel", v)}
              options={[
                { value: "", label: "All channels" },
                { value: "EMAIL", label: "Email" },
                { value: "WHATSAPP", label: "WhatsApp" },
                { value: "SMS", label: "SMS" },
              ]}
            />
          </div>

          {/* Status */}
          <div>
            <FieldLabel>Status</FieldLabel>
            <ModernSelect
              ariaLabel="Status filter"
              placeholder="All statuses"
              value={(filters.status ?? "") as "" | "SENT" | "FAILED" | "PENDING"}
              onChange={(v: any) => updateFilter("status", v)}
              options={[
                { value: "", label: "All statuses" },
                { value: "SENT", label: "Sent" },
                { value: "FAILED", label: "Failed" },
                { value: "PENDING", label: "Pending" },
              ]}
            />
          </div>

          {/* Template */}
          <div>
            <FieldLabel>Template</FieldLabel>
            <ModernSelect
              ariaLabel="Template filter"
              placeholder="All templates"
              value={(filters.template ?? "") as "" | "otp" | "welcome" | "resetPassword"}
              onChange={(v: any) => updateFilter("template", v)}
              options={[
                { value: "", label: "All templates" },
                { value: "otp", label: "OTP" },
                { value: "welcome", label: "Welcome" },
                { value: "resetPassword", label: "Reset Password" },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4 items-end border-t border-admin-border/40 pt-4 mt-2">
          <div>
            <FieldLabel>Date From</FieldLabel>
            <input
              type="date"
              value={filters.from ?? ""}
              className={inputClass}
              onChange={(e) => updateFilter("from", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Date To</FieldLabel>
            <input
              type="date"
              value={filters.to ?? ""}
              className={inputClass}
              onChange={(e) => updateFilter("to", e.target.value)}
            />
          </div>
          <div className="sm:col-span-1 lg:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9.5 items-center justify-center gap-2 rounded-lg border border-admin-border bg-admin-bg/50 px-4 text-[13px] font-medium text-admin-fg hover:bg-admin-muted/10 transition-colors w-full sm:w-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}