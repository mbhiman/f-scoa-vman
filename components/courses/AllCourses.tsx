/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useListCourses, type Course } from "@/hooks/studentCourses/useListCourses";
import { buttonHover, buttonTap, fadeIn, scaleIn, slideUp, staggerContainer } from "@/lib/animation/animations";

type DropdownOption<T extends string> = { value: T; label: string };

function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (el.contains(target)) return;
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener, { passive: true });
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler, ref]);
}

function FancyDropdown<T extends string>({
  ariaLabel,
  value,
  onChange,
  options,
  minWidthClass = "sm:min-w-[170px]",
}: {
  ariaLabel: string;
  value: T;
  onChange: (v: T) => void;
  options: DropdownOption<T>[];
  minWidthClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = options.find((o) => o.value === value) ?? options[0];

  useOnClickOutside(rootRef, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div ref={rootRef} className={`relative w-full ${minWidthClass}`}>
      <motion.button
        type="button"
        whileHover={buttonHover}
        whileTap={buttonTap}
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "group flex h-11 w-full items-center justify-between gap-3 rounded-2xl border bg-background px-4 text-left",
          "transition-all duration-200",
          "border-border shadow-sm hover:border-border-hover hover:shadow-md",
          "focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary",
          open ? "border-primary shadow-md" : "",
        ].join(" ")}
      >
        <span className="truncate text-sm font-medium text-foreground">{active?.label ?? "Select"}</span>
        <span className="flex items-center text-muted transition-colors group-hover:text-foreground">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </motion.button>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className={[
            "absolute left-0 right-0 z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-background",
            "shadow-[0_18px_40px_-18px_rgba(2,6,23,0.35)] backdrop-blur",
          ].join(" ")}
          role="listbox"
          aria-label={ariaLabel}
        >
          <div className="max-h-72 overflow-auto p-1">
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm transition-all",
                    "hover:bg-primary/8 hover:text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15",
                    selected ? "bg-primary/10 text-foreground" : "text-muted",
                  ].join(" ")}
                >
                  <span className="truncate">{opt.label}</span>
                  {selected ? (
                    <span className="text-primary">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M20 6 9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

function getUserStateLabel(state: Course["user_state"]) {
  switch (state) {
    case "NOT_ENROLLED":
      return "Not enrolled";
    case "ENROLLED":
      return "Enrolled";
    case "IN_PROGRESS":
      return "In progress";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
    default:
      return "Browse";
  }
}

function getUserStateBadgeClass(state: Course["user_state"]) {
  switch (state) {
    case "COMPLETED":
      return "badge-success";
    case "FAILED":
      return "badge-error";
    case "IN_PROGRESS":
    case "ENROLLED":
      return "badge-admin-accent";
    case "NOT_ENROLLED":
    default:
      return "badge-muted";
  }
}

function getCourseSubtitle(course: Course) {
  if (course.user_state === "IN_PROGRESS" && course.attempt?.status === "IN_PROGRESS") {
    return `Attempt #${course.attempt.attempt_no} • In progress`;
  }

  if (course.user_state === "COMPLETED" && course.attempt?.status === "SUBMITTED" && course.attempt.passed) {
    const score = typeof course.attempt.score_percentage === "number" ? `${course.attempt.score_percentage}%` : "Passed";
    return `Passed • ${score}`;
  }

  if (course.user_state === "FAILED" && course.attempt?.status === "SUBMITTED" && course.attempt.passed === false) {
    const remaining = typeof course.attempt.remaining_attempts === "number" ? course.attempt.remaining_attempts : null;
    return remaining === null ? "Failed" : `Failed • ${remaining} attempt${remaining === 1 ? "" : "s"} left`;
  }

  if (course.user_state === "ENROLLED") return "Ready to start";
  return course.isNcvet ? "NCVET course" : "Self-paced course";
}

function getFallbackInitial(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return "C";
  return trimmed[0]?.toUpperCase() ?? "C";
}

export default function AllCourses() {
  const router = useRouter();

  // Keep typing instant (hook already debounces search requests).
  const [searchInput, setSearchInput] = useState("");
  const [isNcvetFilter, setIsNcvetFilter] = useState<"ALL" | "NCVET" | "NON_NCVET">("ALL");
  const [userStateFilter, setUserStateFilter] = useState<
    "ALL" | NonNullable<Course["user_state"]>
  >("ALL");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, meta, loading, error } = useListCourses({ page, limit, search: searchInput.trim() });
  // Keep showing previous results while searching to avoid loader flicker.
  const [stableCourses, setStableCourses] = useState<Course[]>([]);
  const [stableMeta, setStableMeta] = useState<typeof meta>(null);
  const [stableSearch, setStableSearch] = useState("");

  useEffect(() => {
    if (!loading && !error) {
      setStableCourses(data);
      setStableMeta(meta);
      setStableSearch(searchInput.trim());
    }
  }, [data, error, loading, meta, searchInput]);

  const isSearching = Boolean(searchInput.trim()) && searchInput.trim() !== stableSearch;
  const displayCourses = isSearching ? stableCourses : data;
  const displayMeta = isSearching ? stableMeta : meta;
  const shouldShowSkeleton = loading && displayCourses.length === 0;

  // Enforce "search by title only" regardless of backend search behavior.
  const visibleCourses = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    return displayCourses.filter((c) => {
      if (isNcvetFilter === "NCVET" && !c.isNcvet) return false;
      if (isNcvetFilter === "NON_NCVET" && c.isNcvet) return false;
      if (userStateFilter !== "ALL" && c.user_state !== userStateFilter) return false;
      if (!q) return true;
      return (c.title ?? "").toLowerCase().includes(q);
    });
  }, [displayCourses, isNcvetFilter, searchInput, userStateFilter]);

  const showingText = useMemo(() => {
    const total = displayMeta?.total;
    if (typeof total !== "number") return null;
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    if (total === 0) return "Showing 0 courses";
    return `Showing ${start}-${end} of ${total}`;
  }, [displayMeta?.total, limit, page]);

  const canPrev = Boolean(displayMeta?.hasPrev) && !loading;
  const canNext = Boolean(displayMeta?.hasNext) && !loading;

  return (
    <div className="w-full">
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="admin-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">All Courses</h2>
            <p className="text-sm text-muted">Browse available courses and track your status.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:w-[320px]">
              <input
                className="input-field px-10"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                placeholder="Search courses..."
                aria-label="Search courses"
              />
              {searchInput && (
                <motion.button
                  type="button"
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-muted hover:text-foreground"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M18 6 6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.button>
              )}
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted">
            {showingText ?? (loading ? "Loading courses..." : "")}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <FancyDropdown
                ariaLabel="Filter by course type"
                value={isNcvetFilter}
                onChange={(v) => {
                  setIsNcvetFilter(v);
                  setPage(1);
                }}
                options={[
                  { value: "ALL", label: "All types" },
                  { value: "NCVET", label: "NCVET only" },
                  { value: "NON_NCVET", label: "Non‑NCVET only" },
                ]}
                minWidthClass="sm:min-w-[170px]"
              />

              <FancyDropdown
                ariaLabel="Filter by status"
                value={userStateFilter}
                onChange={(v) => {
                  setUserStateFilter(v);
                  setPage(1);
                }}
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "NOT_ENROLLED", label: "Not enrolled" },
                  { value: "ENROLLED", label: "Enrolled" },
                  { value: "IN_PROGRESS", label: "In progress" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "FAILED", label: "Failed" },
                ]}
                minWidthClass="sm:min-w-[190px]"
              />
            </div>

            <motion.button
              type="button"
              whileHover={canPrev ? buttonHover : undefined}
              whileTap={canPrev ? buttonTap : undefined}
              className="btn rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-all disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </motion.button>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted">
              Page {displayMeta?.page ?? page}
              {displayMeta?.totalPages ? ` / ${displayMeta.totalPages}` : ""}
            </div>
            <motion.button
              type="button"
              whileHover={canNext ? buttonHover : undefined}
              whileTap={canNext ? buttonTap : undefined}
              className="btn rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-all disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </motion.button>
          </div>
        </div>

        {error ? (
          <motion.div variants={slideUp} initial="hidden" animate="visible" className="mt-6 rounded-xl border border-border bg-background p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-red-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">Couldn’t load courses</div>
                <div className="mt-1 text-sm text-muted">{error}</div>
              </div>
            </div>
          </motion.div>
        ) : null}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {shouldShowSkeleton
            ? Array.from({ length: 8 }).map((_, idx) => (
                <motion.div
                  key={`sk-${idx}`}
                  variants={scaleIn}
                  className="overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
                >
                  <div className="h-36 w-full animate-pulse bg-muted/20" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted/20" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted/20" />
                    <div className="flex gap-2">
                      <div className="h-5 w-20 animate-pulse rounded-full bg-muted/20" />
                      <div className="h-5 w-16 animate-pulse rounded-full bg-muted/20" />
                    </div>
                  </div>
                </motion.div>
              ))
            : visibleCourses.map((course) => {
                const stateLabel = getUserStateLabel(course.user_state ?? null);
                const badgeClass = getUserStateBadgeClass(course.user_state ?? null);
                const subtitle = getCourseSubtitle(course);
                const initial = getFallbackInitial(course.title);

                return (
                  <motion.div
                    key={course.id}
                    variants={slideUp}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-background shadow-lg transition-all hover:border-border-hover"
                  >
                    <div className="relative h-36 w-full overflow-hidden bg-linear-to-br from-primary/10 via-background to-secondary/15">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                            {initial}
                          </div>
                        </div>
                      )}

                      <div className="absolute left-3 top-3 flex items-center gap-2">
                        <span className={badgeClass}>{stateLabel}</span>
                        {course.isNcvet ? <span className="badge-muted">NCVET</span> : null}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{course.title}</h3>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-muted">{subtitle}</p>

                      <div
                        className={`mt-4 flex items-center gap-2 ${
                          course.attempt?.status ? "justify-between" : "justify-end"
                        }`}
                      >
                        {course.attempt?.status ? (
                          <div className="text-xs text-muted">
                            <span className="rounded-md border border-border bg-background px-2 py-1">
                              {course.attempt.status.replace("_", " ")}
                            </span>
                          </div>
                        ) : null}

                        <div className="flex items-center gap-2">
                          <motion.button
                            type="button"
                            whileHover={buttonHover}
                            whileTap={buttonTap}
                            className="btn rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-all hover:bg-primary-hover"
                            onClick={() => {
                              router.push(`/learner/courses/${course.id}`);
                            }}
                          >
                            View
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
                      <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-secondary/15 blur-2xl" />
                    </div>
                  </motion.div>
                );
              })}
        </motion.div>

        {!shouldShowSkeleton && !error && visibleCourses.length === 0 ? (
          <motion.div variants={slideUp} initial="hidden" animate="visible" className="mt-8 rounded-2xl border border-border bg-background p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H7a3 3 0 0 1-3-3V7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M8 9h8M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="mt-3 text-sm font-semibold text-foreground">No courses found</div>
            <div className="mt-1 text-sm text-muted">Try adjusting your search or filters.</div>
            <div className="mt-5 flex justify-center gap-2">
              <motion.button
                type="button"
                whileHover={buttonHover}
                whileTap={buttonTap}
                className="btn rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
                onClick={() => {
                  setSearchInput("");
                  setPage(1);
                }}
              >
                Clear search
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
