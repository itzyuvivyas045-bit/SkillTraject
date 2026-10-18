import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SkillBadge from "@/components/SkillBadge";

const TIERS = [
  { name: "Listed", glyph: "?", note: "Added to your profile, not checked yet.", bg: "bg-mist" },
  { name: "Verified", glyph: "✓", note: "Your certificate was checked.", bg: "bg-mint" },
  { name: "Gold", glyph: "★", note: "You passed the skill test.", bg: "bg-gold" },
];

export default async function StudentHome() {
  const profile = await requireRole("student");
  const firstName = profile.full_name?.split(" ")[0] ?? "there";
  const supabase = await createClient();

  const [{ data: skills }, { data: mine }] = await Promise.all([
    supabase.from("skills").select("id, name"),
    supabase
      .from("student_skills")
      .select("skill_id, trust_tier")
      .eq("student_id", profile.id),
  ]);

  const myList = (mine ?? []).map((m) => ({
    id: m.skill_id as number,
    tier: m.trust_tier as number,
    name:
      (skills ?? []).find((s) => s.id === m.skill_id)?.name ?? "Unknown skill",
  }));

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <h1 className="font-display text-4xl font-extrabold">Hi, {firstName}</h1>

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
                className="flex items-center gap-2 rounded-xl border-2 border-ink px-3 py-2"
              >
                <span className="font-semibold">{s.name}</span>
                <SkillBadge tier={s.tier} />
              </li>
            ))}
          </ul>
        )}

        <Link href="/student/skills" className="btn btn-primary">
          {myList.length === 0 ? "Add your first skill" : "Manage skills"}
        </Link>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.name} className={`card flex items-start gap-4 p-5 ${t.bg}`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-white font-display text-lg font-extrabold">
              {t.glyph}
            </span>
            <div>
              <h3 className="font-display text-lg font-bold">{t.name}</h3>
              <p className="text-sm">{t.note}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}