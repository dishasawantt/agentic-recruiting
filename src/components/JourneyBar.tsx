"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LAST_APPLY_PATH_KEY } from "@/lib/candidate-session";

const STEPS = [
  { key: "jobs", href: "/", label: "Jobs", match: (p: string) => p === "/" },
  {
    key: "apply",
    hrefKey: "apply" as const,
    label: "Apply",
    match: (p: string) => p.startsWith("/apply/"),
  },
  {
    key: "interview",
    href: "/interview",
    label: "Interview",
    match: (p: string) => p === "/interview",
  },
  {
    key: "review",
    href: "/interview-review",
    label: "Results",
    match: (p: string) => p === "/interview-review",
  },
] as const;

export function JourneyBar() {
  const pathname = usePathname();
  const [applyHref, setApplyHref] = useState("/");

  useEffect(() => {
    try {
      const p = sessionStorage.getItem(LAST_APPLY_PATH_KEY);
      if (p && p.startsWith("/apply/")) setApplyHref(p);
    } catch {
      /* ignore */
    }
  }, [pathname]);

  const stepIndex = STEPS.findIndex((s) => s.match(pathname));
  const shellMax =
    pathname === "/interview" || pathname === "/interview-review"
      ? "max-w-[1100px]"
      : "max-w-6xl";

  return (
    <div className="border-b border-slate-200/60 bg-white/50 backdrop-blur-sm">
      <div
        className={`mx-auto flex ${shellMax} flex-wrap items-center justify-center gap-1.5 px-4 py-2.5 md:justify-start md:gap-1`}
      >
        {STEPS.map((s, i) => {
          const href = "hrefKey" in s ? applyHref : s.href;
          const active = s.match(pathname);
          const done = stepIndex > i;
          return (
            <div key={s.key} className="flex items-center">
              {i > 0 && (
                <span
                  className="mx-1 hidden text-slate-300 sm:inline"
                  aria-hidden
                >
                  /
                </span>
              )}
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring rounded-full px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition sm:px-3.5 ${
                  active
                    ? "bg-sage-600 text-white shadow-sm"
                    : done
                      ? "text-sage-700 hover:bg-sage-100/90"
                      : "text-slate-400 hover:bg-white/70 hover:text-slate-700"
                }`}
              >
                <span className="tabular-nums text-slate-400">{i + 1}.</span>{" "}
                {s.label}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
