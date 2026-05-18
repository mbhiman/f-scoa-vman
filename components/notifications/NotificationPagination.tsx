"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/hooks/useNotifications";

type Props = {
  meta: PaginationMeta;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
};

function visiblePageNumbers(current: number, totalPages: number): number[] {
  if (totalPages <= 1) return [1];
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

export default function NotificationPagination({ meta, loading, page, onPageChange }: Props) {
  const totalPages = Math.max(1, meta.totalPages || 1);
  const pages = visiblePageNumbers(page, totalPages);

  return (
    <nav className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5 border-t border-admin-border/40 mt-2">
      <p className="text-center text-[12px] sm:text-[13px] text-admin-muted-foreground sm:text-left">
        Showing page <span className="font-semibold text-admin-fg">{meta.page}</span> of <span className="font-semibold text-admin-fg">{totalPages}</span>
        <span className="hidden sm:inline"> · <span className="font-semibold text-admin-fg">{meta.total}</span> total logs</span>
      </p>

      <div className="flex items-center justify-center gap-1.5 sm:justify-end">
        <button
          disabled={!meta.hasPrev || loading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-admin-border bg-admin-card text-admin-fg hover:bg-admin-muted/5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p) => {
            const active = p === page;
            return (
              <button
                key={p}
                disabled={loading}
                onClick={() => onPageChange(p)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-md text-[13px] font-medium transition-colors ${active
                    ? "bg-admin-primary/10 text-admin-primary"
                    : "text-admin-muted-foreground hover:bg-admin-muted/5 hover:text-admin-fg"
                  }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          disabled={!meta.hasNext || loading}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-admin-border bg-admin-card text-admin-fg hover:bg-admin-muted/5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}