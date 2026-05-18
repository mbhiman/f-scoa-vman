"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  ClipboardList,
  Award,
  BarChart3,
  Shield,
  ScrollText,
  Settings,
  GraduationCap,
  PanelLeftClose,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";

const navItems = [
  {
    title: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Learning",
    items: [
      { href: "/admin/learners", label: "Learners", icon: Users },
      { href: "/admin/courses", label: "Courses", icon: BookOpen },
      { href: "/admin/questions", label: "Questions", icon: HelpCircle },
      { href: "/admin/assessments", label: "Assessments", icon: ClipboardList },
      { href: "/admin/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/admins", label: "Admins", icon: Shield },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <>
      {/* Mobile Backdrop Overlay - Closes sidebar when clicking outside */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed md:relative z-50 flex flex-col h-full border-r transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "translate-x-0 w-64"}
        bg-admin-card border-admin-border shadow-2xl md:shadow-none`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-admin-border/50 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-admin-primary text-white shadow-sm shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>

          {!sidebarCollapsed && (
            <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
              <p className="text-sm font-bold text-admin-foreground truncate">
                SCOA Admin
              </p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-admin-muted-foreground truncate">
                Flipkart Academy
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 custom-scrollbar">
          {navItems.map((group) => (
            <div key={group.title} className="mb-6">
              {!sidebarCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-admin-muted-foreground/70">
                  {group.title}
                </p>
              )}

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          // Auto-collapse on mobile when a link is clicked
                          if (window.innerWidth < 768) toggleSidebar();
                        }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group
                        ${sidebarCollapsed ? "justify-center" : ""}
                        ${isActive
                            ? "bg-admin-primary/10 text-admin-primary"
                            : "text-admin-muted-foreground hover:bg-admin-muted/10 hover:text-admin-fg"
                          }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? "text-admin-primary" : "text-admin-muted-foreground group-hover:text-admin-fg"}`} />
                        {!sidebarCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Toggle - Hidden on Mobile! */}
        <div className="hidden md:block p-3 border-t border-admin-border/50">
          <button
            onClick={toggleSidebar}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
            text-admin-muted-foreground hover:bg-admin-muted/10 hover:text-admin-fg
            ${sidebarCollapsed ? "justify-center" : ""}`}
            title="Toggle Sidebar"
          >
            <PanelLeftClose
              className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`}
            />
            {!sidebarCollapsed && <span className="truncate">Collapse Menu</span>}
          </button>
        </div>
      </aside>
    </>
  );
}