"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/student", label: "Overview" },
  { href: "/student/skills", label: "Skills" },
  { href: "/student/profile", label: "Profile" },
];

export default function StudentNav() {
  const pathname = usePathname();

  return (
    <div className="border-b-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl gap-2 px-6 py-3">
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