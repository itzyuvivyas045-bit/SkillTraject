"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/company", label: "Overview" },
  { href: "/company/search", label: "Search students" },
  { href: "/company/shortlist", label: "Shortlist" },
];

export default function CompanyNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 py-3">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={pathname === t.href ? "page" : undefined}
            className={`chip ${pathname === t.href ? "chip-active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}