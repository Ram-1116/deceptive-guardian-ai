import { Link, Outlet } from "@tanstack/react-router";
import { FileText, GitBranch, History, LayoutDashboard, ScanSearch, Settings } from "lucide-react";
import { Wordmark } from "./Logo";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/analyze", label: "Analyze", icon: ScanSearch },
  { to: "/history", label: "History", icon: History },
  { to: "/attack-chains", label: "Attack chains", icon: GitBranch },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings & privacy", icon: Settings },
] as const;

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <aside className="no-print fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="px-5 py-5">
          <Wordmark />
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="m-3 rounded-lg border border-sidebar-border p-3 text-xs text-muted-foreground">
          <div className="mb-1 font-medium text-foreground">HACKINDIA AI & CyberTech 2026</div>
          In association with KIT Kanpur
          <div className="mt-1 font-mono">ThreatForge</div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-8">
            <div className="lg:hidden"><Wordmark /></div>
            <p className="hidden text-sm text-muted-foreground lg:block">
              See beyond the link. Understand the deception. Stop the attack.
            </p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden" aria-label="Main mobile">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-muted-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground">
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="print-full mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
