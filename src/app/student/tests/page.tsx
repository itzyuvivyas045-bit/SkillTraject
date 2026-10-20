import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SkillBadge from "@/components/SkillBadge";

export default async function TestsPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const [{ data: skills }, { data: mine }, { data: results }] =
    await Promise.all([
      supabase.from("skills").select("id, name"),
      supabase
        .from("skill_status")
        .select("skill_id, tier, gold_expires_at")
        .eq("student_id", profile.id),
      supabase
        .from("test_results")
        .select("skill_id, score, total")
        .eq("student_id", profile.id)
        .order("taken_at", { ascending: false }),
    ]);

  const nameById: Record<number, string> = Object.fromEntries(
    (skills ?? []).map((s) => [s.id, s.name])
  );

  const lastBySkill: Record<number, { score: number; total: number }> = {};
  for (const r of results ?? []) {
    if (!(r.skill_id in lastBySkill)) {
      lastBySkill[r.skill_id] = { score: r.score, total: r.total };
    }
  }

  const list = (mine ?? []).map((m) => ({
    id: m.skill_id as number,
    tier: m.tier as number,
    name: nameById[m.skill_id] ?? "Unknown skill",
    last: lastBySkill[m.skill_id] ?? null,
    until: m.gold_expires_at
      ? new Date(m.gold_expires_at).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })
      : null,
  }));

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Skill tests</h1>
        <p className="mt-2 max-w-xl">
          Five questions, five minutes. Get 4 right to earn a gold badge on the
          skill.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="card space-y-4 p-6">
          <p>Tests are taken on skills you've added, and you haven't added any yet.</p>
          <Link href="/student/skills" className="btn btn-primary">
            Add a skill first
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <div key={s.id} className="card flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-bold">{s.name}</h3>
                <SkillBadge tier={s.tier} />
              </div>

              <p className="text-sm">
                {s.last
                  ? `Last attempt: ${s.last.score} of ${s.last.total}`
                  : "Not attempted yet"}
              </p>

              {s.tier >= 2 ? (
                <p className="text-sm font-semibold">
                  Gold badge earned{s.until ? ` until ${s.until}` : ""}
                </p>
              ) : (
                <Link
                  href={`/student/test?skill=${s.id}`}
                  className="btn btn-primary"
                >
                  {s.last ? "Try again" : "Take the test"}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}