"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Roles" },
  { href: "/interview-review", label: "Review" },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const shellMax =
    pathname === "/interview" || pathname === "/interview-review"
      ? "max-w-[1100px]"
      : "max-w-6xl";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[var(--card)]/80 shadow-sm backdrop-blur-md">
      <div
        className={`mx-auto flex ${shellMax} flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6`}
      >
        <Link href="/" className="focus-ring rounded-lg py-1">
          <span className="text-base font-bold tracking-tight text-slate-900">
            Agentic
          </span>
          <span className="ml-2 text-xs font-medium uppercase tracking-wider text-slate-400">
            Recruiting
          </span>
        </Link>
        <nav
          className="flex flex-wrap items-center justify-end gap-1"
          aria-label="Main"
        >
          {NAV.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring inline-flex min-h-[40px] items-center rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  active
                    ? "bg-sage-100 text-sage-900"
                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
