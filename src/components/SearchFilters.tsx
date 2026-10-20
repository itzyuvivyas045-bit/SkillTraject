"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

const TIER_OPTIONS = [
  { value: "0", label: "Any badge" },
  { value: "1", label: "Verified or better" },
  { value: "2", label: "Gold only" },
];

function build(skill: string, tier: string, q: string) {
  const params = new URLSearchParams();
  if (skill) params.set("skill", skill);
  if (tier !== "0") params.set("tier", tier);
  if (q.trim()) params.set("q", q.trim());
  return params.toString();
}

export default function SearchFilters({
  skills,
  initial,
}: {
  skills: { id: number; name: string }[];
  initial: { skill: string; tier: string; q: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const [skill, setSkill] = useState(initial.skill);
  const [tier, setTier] = useState(initial.tier);
  const [q, setQ] = useState(initial.q);

  const lastQs = useRef(build(initial.skill, initial.tier, initial.q));

  useEffect(() => {
    const t = setTimeout(() => {
      const qs = build(skill, tier, q);
      if (qs === lastQs.current) return;
      lastQs.current = qs;
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [skill, tier, q, pathname, router]);

  const filtering = skill !== "" || tier !== "0" || q.trim() !== "";

  function clear() {
    setSkill("");
    setTier("0");
    setQ("");
  }

  return (
    <div className="card space-y-4 p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="q" className="mb-1 block text-sm font-semibold">
            Name or college
          </label>
          <input
            id="q"
            className="input"
            placeholder="Start typing"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="skill" className="mb-1 block text-sm font-semibold">
            Skill
          </label>
          <select
            id="skill"
            className="input"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          >
            <option value="">Any skill</option>
            {skills.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-1 block text-sm font-semibold">Minimum badge</span>
          <div className="flex flex-wrap gap-2">
            {TIER_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={tier === o.value}
                onClick={() => setTier(o.value)}
                className={`chip ${tier === o.value ? "chip-active" : ""}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm" aria-live="polite">
          {pending ? "Searching..." : "Results update as you type."}
        </p>
        {filtering && (
          <button type="button" onClick={clear} className="btn btn-ghost">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}