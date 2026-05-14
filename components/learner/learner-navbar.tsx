"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { BookDashed, ChevronDown, Home, LogOut, Menu, Settings, User, X } from "lucide-react";
import { motion } from "framer-motion";

import ThemeToggle from "@/components/common/theme-toggle";
import { slideDown, slideUpCompact, staggerContainer } from "@/lib/animation/animations";
import { LearnerAuth } from "@/lib/learner-auth";
import { useStudentAuthStore } from "@/store/student-auth-store";

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/learner/dashboard",
    label: "Dashboard",
    description: "Overview and profile",
    icon: <Home className="size-4 shrink-0" strokeWidth={2} />,
  },

  {
    href: "/learner/profile",
    label: "Profile",
    description: "Account & settings",
    icon: <User className="size-4 shrink-0" strokeWidth={2} />,
  },
  {
    href: "/learner/courses",
    label: "Courses",
    description: "Your courses",
    icon: <BookDashed className="size-4 shrink-0" strokeWidth={2} />,
  },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type StudentProfile = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
};

const BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/$/, "");

function initialsFromName(firstName?: string, lastName?: string) {
  const first = (firstName ?? "").trim().slice(0, 1);
  const last = (lastName ?? "").trim().slice(0, 1);
  const initials = `${first}${last}`.trim().toUpperCase();
  return initials || "ST";
}

async function safeReadJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Shared interaction + a11y tokens */
const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function LearnerNavbar() {
  const pathname = usePathname() ?? "/learner/dashboard";
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const logout = useStudentAuthStore((s) => s.logout);

  const [userOpen, setUserOpen] = React.useState(false);
  const [profile, setProfile] = React.useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const userMenuCloseTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const cancelUserMenuClose = React.useCallback(() => {
    if (userMenuCloseTimerRef.current === null) return;
    window.clearTimeout(userMenuCloseTimerRef.current);
    userMenuCloseTimerRef.current = null;
  }, []);

  const scheduleUserMenuClose = React.useCallback(
    (delayMs: number) => {
      cancelUserMenuClose();
      userMenuCloseTimerRef.current = window.setTimeout(() => {
        setUserOpen(false);
        userMenuCloseTimerRef.current = null;
      }, delayMs);
    },
    [cancelUserMenuClose],
  );

  React.useEffect(() => {
    return () => cancelUserMenuClose();
  }, [cancelUserMenuClose]);

  const handleLogout = async () => {
    cancelUserMenuClose();
    setUserOpen(false);
    await logout();
    router.push("/signin/regular");
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const token = LearnerAuth.getToken();
    if (!token) {
      setProfile(null);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      try {
        setProfileLoading(true);

        if (!BASE_URL) {
          throw new Error("Backend URL is not configured.");
        }

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${token}`);

        const res = await fetch(`${BASE_URL}/student/me`, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        const json = await safeReadJson(res);

        if (!res.ok || !json || typeof json !== "object" || !(json as { success?: unknown })?.success) {
          throw new Error("Failed to fetch student profile.");
        }

        const data = (json as { data?: unknown }).data as Partial<StudentProfile> | undefined;

        if (!data?.id) throw new Error("Failed to fetch student profile.");

        setProfile({
          id: String(data.id),
          firstName: String(data.firstName ?? ""),
          lastName: String(data.lastName ?? ""),
          mobile: String(data.mobile ?? ""),
          email: String(data.email ?? ""),
          isVerified: Boolean(data.isVerified),
          isActive: Boolean(data.isActive),
          lastLoginAt: typeof data.lastLoginAt === "string" ? data.lastLoginAt : null,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setProfile(null);
        await handleLogout();
      } finally {
        setProfileLoading(false);
      }
    };

    void run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim() || "Student"
    : "Student";
  const displayEmail = profile?.email?.trim() || "—";
  const avatarText = initialsFromName(profile?.firstName, profile?.lastName);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-xl backdrop-saturate-150 dark:bg-background/70 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/learner/dashboard"
          className={[
            "group relative -ml-1 inline-flex shrink-0 items-center gap-2.5 rounded-xl px-2 py-1.5",
            "transition-[transform,opacity] duration-200 ease-out hover:opacity-95 active:scale-[0.98]",
            focusRing,
          ].join(" ")}
          aria-label="Go to learner dashboard"
        >
          <span className="relative flex items-center justify-center overflow-hidden rounded-lg">
            <span
              className="pointer-events-none absolute inset-0 rounded-lg bg-linear-to-b from-white/25 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:from-white/10"
              aria-hidden
            />
            <Image
              src="/images/f-scoa-logo.png"
              alt="Flipkart SCOA"
              width={132}
              height={40}
              priority
              className="relative h-8 w-auto object-contain sm:h-9"
            />
          </span>
        </Link>

        <nav
          className="hidden items-center md:flex"
          aria-label="Learner navigation"
        >
          <div
            className={[
              "flex items-center gap-0.5 rounded-full border border-border/70 bg-muted/20 p-1",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md dark:border-border/80 dark:bg-muted/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
            ].join(" ")}
          >
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group font-ui relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium leading-none tracking-tight",
                    "transition-[color,background-color,box-shadow,transform,border-color] duration-200 ease-out",
                    "active:scale-[0.97]",
                    focusRing,
                    active
                      ? [
                          "bg-primary text-white shadow-md shadow-primary/25",
                          "ring-1 ring-white/15 ring-inset",
                        ].join(" ")
                      : [
                          "border border-transparent text-muted",
                          "hover:border-border/80 hover:bg-background/80 hover:text-foreground",
                          "hover:shadow-sm dark:hover:bg-background/40",
                        ].join(" "),
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex shrink-0 items-center justify-center transition-colors duration-200",
                      active ? "text-white" : "text-muted group-hover:text-foreground",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <div
            className="relative hidden md:block"
            onMouseEnter={() => {
              cancelUserMenuClose();
              setUserOpen(true);
            }}
            onMouseLeave={() => scheduleUserMenuClose(1000)}
          >
            <button
              type="button"
              id="learner-user-menu-button"
              onClick={() => setUserOpen((v) => !v)}
              className={[
                "flex max-w-56 items-center gap-2.5 rounded-xl border border-border/80 bg-background/60 px-2 py-1.5 pl-2 pr-2.5",
                "shadow-sm shadow-black/3 backdrop-blur-md transition-[border-color,box-shadow,transform,background-color] duration-200 ease-out",
                "hover:border-border-hover hover:bg-background hover:shadow-md dark:bg-background/50 dark:hover:bg-background/80",
                "active:scale-[0.98]",
                focusRing,
                userOpen && "border-primary/35 bg-background ring-1 ring-primary/15",
              ].join(" ")}
              aria-haspopup="menu"
              aria-expanded={userOpen}
              aria-controls="learner-user-menu"
            >
              <div
                className={[
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold tracking-tight text-white",
                  "bg-linear-to-br from-primary to-primary-hover shadow-inner shadow-black/10 ring-2 ring-white/20",
                ].join(" ")}
              >
                {avatarText}
              </div>

              <span className="hidden min-w-0 flex-1 truncate text-left text-sm font-medium leading-tight text-foreground lg:inline">
                {profileLoading ? "Loading…" : displayName}
              </span>

              <ChevronDown
                className={[
                  "hidden size-4 shrink-0 text-muted transition-transform duration-200 ease-out sm:inline",
                  userOpen && "rotate-180 text-foreground",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>

            {userOpen && (
              <motion.div
                id="learner-user-menu"
                role="menu"
                aria-labelledby="learner-user-menu-button"
                variants={slideDown}
                initial="hidden"
                animate="visible"
                className={[
                  "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-68 origin-top-right overflow-hidden rounded-2xl",
                  "border border-border/80 bg-background/85 shadow-2xl shadow-black/10 ring-1 ring-black/4 backdrop-blur-xl backdrop-saturate-150",
                  "dark:bg-background/90 dark:shadow-black/40 dark:ring-white/6",
                ].join(" ")}
              >
                <div className="border-b border-border/70 bg-linear-to-b from-muted/15 to-transparent px-4 py-3.5">
                  <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                    {profileLoading ? "Loading…" : displayName}
                  </p>
                  <p className="mt-1 truncate text-xs leading-relaxed text-muted">
                    {displayEmail}
                  </p>
                </div>

                <div className="p-1.5">
                  <Link
                    href="/learner/profile"
                    onClick={() => setUserOpen(false)}
                    className={[
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground",
                      "transition-colors duration-150 ease-out hover:bg-muted/50 active:bg-muted/65",
                      focusRing,
                    ].join(" ")}
                    role="menuitem"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-muted/40 text-muted transition-colors duration-150 group-hover:text-foreground">
                      <User className="size-4" strokeWidth={2} aria-hidden="true" />
                    </span>
                    <span className="font-medium">Profile</span>
                  </Link>

                  <Link
                    href="/learner/profile"
                    onClick={() => setUserOpen(false)}
                    className={[
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground",
                      "transition-colors duration-150 ease-out hover:bg-muted/50 active:bg-muted/65",
                      focusRing,
                    ].join(" ")}
                    role="menuitem"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-muted/40 text-muted transition-colors duration-150 group-hover:text-foreground">
                      <Settings className="size-4" strokeWidth={2} aria-hidden="true" />
                    </span>
                    <span className="font-medium">Settings</span>
                  </Link>
                </div>

                <div className="border-t border-border/70 p-1.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={[
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600",
                      "transition-colors duration-150 ease-out hover:bg-red-500/10 active:bg-red-500/[0.14] dark:text-red-400",
                      focusRing,
                    ].join(" ")}
                    role="menuitem"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                      <LogOut className="size-4" strokeWidth={2} aria-hidden="true" />
                    </span>
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <button
            type="button"
            className={[
              "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/70 text-foreground",
              "shadow-sm shadow-black/4 backdrop-blur-sm transition-[border-color,box-shadow,transform,background-color] duration-200 ease-out",
              "hover:border-border-hover hover:bg-background hover:shadow-md active:scale-[0.96]",
              focusRing,
              mobileOpen && "border-primary/30 bg-background ring-1 ring-primary/15",
              "md:hidden",
            ].join(" ")}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="learner-mobile-menu"
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? (
              <X className="size-5" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu className="size-5" strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        id="learner-mobile-menu"
        className={[
          "grid border-t border-border/60 bg-background/80 backdrop-blur-xl backdrop-saturate-150 transition-[grid-template-rows] duration-300 ease-in-out md:hidden dark:bg-background/75",
          mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ].join(" ")}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mx-auto max-w-7xl space-y-4 px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
            <motion.div variants={slideUpCompact} initial={false} animate={mobileOpen ? "visible" : "hidden"}>
              <div
                className={[
                  "flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/15 px-4 py-3.5 shadow-inner shadow-black/2 backdrop-blur-sm sm:hidden",
                  "dark:bg-muted/10",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-tight text-foreground">Menu</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">Navigate your learner space</p>
                </div>
                <ThemeToggle />
              </div>
            </motion.div>

            <motion.nav
              className="flex flex-col gap-2.5"
              aria-label="Mobile learner navigation"
              variants={staggerContainer}
              initial={false}
              animate={mobileOpen ? "visible" : "hidden"}
            >
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <motion.div key={item.href} variants={slideUpCompact}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "group relative block overflow-hidden rounded-2xl border px-4 py-3.5 transition-[border-color,box-shadow,transform,background-color] duration-200 ease-out active:scale-[0.99]",
                        focusRing,
                        active
                          ? [
                              "border-primary/40 bg-primary text-white shadow-lg shadow-primary/25",
                              "ring-1 ring-white/15 ring-inset",
                            ].join(" ")
                          : [
                              "border-border/80 bg-background/60 text-foreground shadow-sm shadow-black/3",
                              "hover:border-border-hover hover:bg-background hover:shadow-md dark:bg-background/40",
                            ].join(" "),
                      ].join(" ")}
                    >
                      {!active && (
                        <span
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          aria-hidden
                        >
                          <span className="absolute inset-0 bg-linear-to-br from-primary/6 to-transparent dark:from-primary/12" />
                        </span>
                      )}
                      <div className="relative flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            className={[
                              "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border transition-[border-color,background-color,color] duration-200",
                              active
                                ? "border-white/25 bg-white/15 text-white"
                                : "border-border/70 bg-muted/25 text-muted group-hover:border-border group-hover:bg-muted/40 group-hover:text-foreground",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            {item.icon}
                          </span>

                          <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                            <span
                              className={[
                                "text-sm font-semibold tracking-tight",
                                active ? "text-white" : "text-foreground",
                              ].join(" ")}
                            >
                              {item.label}
                            </span>
                            <span
                              className={[
                                "text-xs leading-relaxed",
                                active ? "text-white/85" : "text-muted",
                              ].join(" ")}
                            >
                              {item.description}
                            </span>
                          </div>
                        </div>

                        <span
                          className={[
                            "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors duration-200",
                            active
                              ? "border-white/25 bg-white/10 text-white/95"
                              : "border-border/80 bg-muted/20 text-muted group-hover:border-border group-hover:text-foreground",
                          ].join(" ")}
                        >
                          Open
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            <motion.div variants={slideUpCompact} initial={false} animate={mobileOpen ? "visible" : "hidden"}>
              <button
                type="button"
                onClick={handleLogout}
                className={[
                  "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-background/70 px-4 py-3.5 text-sm font-semibold text-foreground",
                  "shadow-sm shadow-black/3 backdrop-blur-sm transition-[border-color,box-shadow,transform,background-color] duration-200 ease-out",
                  "hover:border-border-hover hover:bg-background hover:shadow-md active:scale-[0.99]",
                  focusRing,
                ].join(" ")}
              >
                <LogOut className="size-4 text-muted" strokeWidth={2} aria-hidden="true" />
                Logout
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
}
