"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, TrendingUp, Activity, LayoutDashboard, Zap, Kanban } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/opportunities", label: "Opportunities", icon: TrendingUp },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/activities", label: "Activities", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-gray-900 text-gray-300 flex flex-col min-h-screen flex-shrink-0">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Enterprise CRM</p>
            <p className="text-gray-500 text-xs">Sales Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-600">v0.1.0 · Enterprise CRM</p>
      </div>
    </aside>
  );
}
