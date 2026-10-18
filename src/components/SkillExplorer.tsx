"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SkillBadge from "./SkillBadge";

type Skill = { id: number; name: string; category: string | null };
type Mine = { skill_id: number; trust_tier: number };

export default function SkillExplorer({
  userId,
  skills,
  initialMine,
}: {
  userId: string;
  skills: Skill[];
  initialMine: Mine[];
}) {
  const supabase = createClient();

  const [mine, setMine] = useState<Record<number, number>>(
    Object.fromEntries(initialMine.map((m) => [m.skill_id, m.trust_tier]))
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(skills.map((s) => s.category ?? "Other"))),
    ],
    [skills]
  );

  const visible = skills.filter((s) => {
    const inCategory =
      category === "All" || (s.category ?? "Other") === category;
    const matches = s.name.toLowerCase().includes(query.trim().toLowerCase());
    return inCategory && matches;
  });

  async function toggle(skillId: number) {
    setBusy(skillId);
    setError("");
    const has = skillId in mine;

    const { error } = has
      ? await supabase
          .from("student_skills")
          .delete()
          .eq("student_id", userId)
          .eq("skill_id", skillId)
      : await supabase
          .from("student_skills")
          .insert({ student_id: userId, skill_id: skillId });

    if (error) {
      setError(error.message);
    } else {
      setMine((prev) => {
        const next = { ...prev };
        if (has) delete next[skillId];
        else next[skillId] = 0;
        return next;
      });
    }
    setBusy(null);
  }

  const count = Object.keys(mine).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          className="input md:max-w-xs"
          placeholder="Search skills"
          aria-label="Search skills"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`chip ${c === category ? "chip-active" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm font-semibold">
        {count} {count === 1 ? "skill" : "skills"} on your profile
      </p>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-line bg-coral/20 px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <div className="card p-6">
          <p>Nothing matches that search. Try another word or pick All.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => {
            const added = s.id in mine;
            return (
              <div
                key={s.id}
                className="card flex flex-col justify-between gap-4 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold">
                      {s.name}
                    </h3>
                    <p className="text-sm">{s.category ?? "Other"}</p>
                  </div>
                  {added && <SkillBadge tier={mine[s.id]} />}
                </div>
                <button
                  onClick={() => toggle(s.id)}
                  disabled={busy === s.id}
                  className={`btn ${added ? "btn-ghost" : "btn-primary"}`}
                >
                  {busy === s.id
                    ? "Saving..."
                    : added
                    ? "Remove"
                    : "Add to profile"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}