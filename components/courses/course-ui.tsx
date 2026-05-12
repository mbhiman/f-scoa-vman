"use client";

import React from "react";
import { motion } from "framer-motion";
import { slideUpCompact } from "@/lib/animation/animations";

/** Shared visual tokens for learner course flows — keep in sync across Course* views */
export const courseUi = {
  cardRaise:
    "rounded-2xl border border-border bg-background/80 shadow-sm backdrop-blur-sm transition-[box-shadow,transform,border-color] duration-200 hover:border-border-hover hover:shadow-md",
  focusRing: "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  inputElevated:
    "input-field rounded-xl border-border/90 bg-background px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow] duration-200",
  pillSegment:
    "inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-muted shadow-sm transition-colors",
} as const;

type AlertVariant = "error" | "success" | "warning" | "info" | "neutral";

const alertVariantClass: Record<AlertVariant, string> = {
  error: "border-red-500/20 bg-red-500/[0.06] text-red-700 dark:text-red-400/95",
  success: "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-800 dark:text-emerald-400/95",
  warning: "border-amber-500/25 bg-amber-500/[0.07] text-amber-900 dark:text-amber-200/90",
  info: "border-primary/20 bg-primary/[0.06] text-foreground",
  neutral: "border-border bg-muted/15 text-foreground",
};

const alertIcon: Record<AlertVariant, React.ReactNode> = {
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M12 9v4m0 3h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  neutral: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 16v-5M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export function CourseAlert({
  variant,
  title,
  children,
  className = "",
  role = "alert",
}: {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  role?: "alert" | "status";
}) {
  return (
    <div
      role={role}
      className={[
        "flex gap-3 rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
        alertVariantClass[variant],
        className,
      ].join(" ")}
    >
      <span className="mt-0.5 opacity-90">{alertIcon[variant]}</span>
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold tracking-tight">{title}</p> : null}
        <div className={title ? "mt-1 text-[13px] opacity-95" : ""}>{children}</div>
      </div>
    </div>
  );
}

export function CourseSkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse rounded-lg bg-linear-to-r from-muted/15 via-muted/25 to-muted/15 bg-size-[200%_100%]",
        className,
      ].join(" ")}
      aria-hidden
    />
  );
}

export function CoursePanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <CourseSkeletonLine key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function CourseSectionTitle({
  children,
  description,
}: {
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="border-b border-border/80 pb-3">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{children}</h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
    </div>
  );
}

/** Accessible selectable row for exams / radios — preserves native input for forms */
export function CourseSelectableRow({
  name,
  checked,
  onChange,
  label,
  disabled,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <label
      className={[
        "group flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-[border-color,background-color,box-shadow] duration-200",
        checked
          ? "border-primary/35 bg-primary/[0.07] shadow-[inset_0_0_0_1px_rgba(22,66,185,0.12)]"
          : "border-border bg-background/60 hover:border-border-hover hover:bg-muted/20",
        disabled ? "cursor-not-allowed opacity-60" : "",
        courseUi.focusRing,
      ].join(" ")}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 h-4 w-4 shrink-0 rounded-full border-border text-primary focus:ring-primary/30"
      />
      <span className="flex-1 leading-snug text-foreground">{label}</span>
    </label>
  );
}

export function CourseMotionFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={slideUpCompact} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}
