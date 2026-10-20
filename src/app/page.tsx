import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SkillBadge from "@/components/SkillBadge";

const TIERS = [
  { name: "Gold", glyph: "★", note: "You passed the skill test.", bg: "bg-gold" },
  { name: "Verified", glyph: "✓", note: "Your certificate was checked.", bg: "bg-mint" },
  { name: "Listed", glyph: "?", note: "Added to your profile, not checked yet.", bg: "bg-mist" },
];

export default async function StudentHome() {
  const profile = await requireRole("student");
  const firstName = profile.full_name?.split(" ")[0] ?? "there";
  const supabase = await createClient();

  const [{ data: skills }, { data: mine }] = await Promise.all([
    supabase.from("skills").select("id, name"),
    supabase
      .from("skill_status")
      .select("skill_id, tier, gold_expires_at")
      .eq("student_id", profile.id),
  ]);

  const nameById: Record<number, string> = Object.fromEntries(
    (skills ?? []).map((s) => [s.id, s.name])
  );

  const myList = (mine ?? [])
    .map((m) => ({
      id: m.skill_id as number,
      tier: m.tier as number,
      name: nameById[m.skill_id] ?? "Unknown skill",
      until:
        m.tier === 2 && m.gold_expires_at
          ? new Date(m.gold_expires_at).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            })
          : null,
    }))
    .sort((a, b) => b.tier - a.tier);

  const counts = [2, 1, 0].map(
    (t) => myList.filter((s) => s.tier === t).length
  );

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <h1 className="font-display text-4xl font-extrabold">Hi, {firstName}</h1>

      <section className="grid gap-5 md:grid-cols-3">
        {TIERS.map((t, i) => (
          <div key={t.name} className={`card flex items-start gap-4 p-5 ${t.bg}`}>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface font-display text-2xl font-extrabold text-ink">
              {counts[i]}
            </span>
            <div>
              <h3 className="font-display text-lg font-bold">
                {t.glyph} {t.name}
              </h3>
              <p className="text-sm">{t.note}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-xl font-bold">Your skills</h2>

        {myList.length === 0 ? (
          <p>
            You haven't added any skills yet. Add your first one to start
            building trust.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {myList.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-2 rounded-xl border border-line px-3 py-2"
              >
                <span className="font-semibold">{s.name}</span>
                <SkillBadge tier={s.tier} />
                {s.until && <span className="text-xs">until {s.until}</span>}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/student/skills" className="btn btn-primary">
            {myList.length === 0 ? "Add your first skill" : "Manage skills"}
          </Link>
          {myList.length > 0 && (
            <Link href="/student/tests" className="btn btn-ghost">
              Take a test
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}