import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SearchFilters from "@/components/SearchFilters";
import SkillBadge from "@/components/SkillBadge";

type Params = { skill?: string; tier?: string; q?: string };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  await requireRole("company");
  const params = await searchParams;

  const skillId = params.skill ? Number(params.skill) : null;
  const minTier = Math.min(2, Math.max(0, Number(params.tier ?? 0) || 0));
  const q = (params.q ?? "").replace(/[%,()*\\]/g, " ").trim().slice(0, 60);

  const supabase = await createClient();

  let peopleQuery = supabase
    .from("profiles")
    .select("id, full_name, college")
    .eq("role", "student")
    .limit(100);

  if (q) {
    peopleQuery = peopleQuery.or(
      `full_name.ilike.%${q}%,college.ilike.%${q}%`
    );
  }

  const [{ data: skills }, { data: people }] = await Promise.all([
    supabase.from("skills").select("id, name").order("name"),
    peopleQuery,
  ]);

  const ids = (people ?? []).map((p) => p.id as string);

  const { data: statuses } = ids.length
    ? await supabase
        .from("skill_status")
        .select("student_id, skill_id, tier")
        .in("student_id", ids)
    : { data: [] as { student_id: string; skill_id: number; tier: number }[] };

  const nameById: Record<number, string> = Object.fromEntries(
    (skills ?? []).map((s) => [s.id, s.name])
  );

  const byStudent: Record<string, { skill_id: number; tier: number }[]> = {};
  for (const s of statuses ?? []) {
    (byStudent[s.student_id] ??= []).push({
      skill_id: s.skill_id as number,
      tier: s.tier as number,
    });
  }

  const filtering = skillId !== null || minTier > 0;

  const results = (people ?? [])
    .map((p) => {
      const list = (byStudent[p.id] ?? []).sort((a, b) => b.tier - a.tier);
      const matched = list.filter(
        (s) => (skillId ? s.skill_id === skillId : true) && s.tier >= minTier
      );
      return {
        id: p.id as string,
        name: p.full_name as string | null,
        college: p.college as string | null,
        list,
        matched,
      };
    })
    .filter((r) => r.list.length > 0 && r.matched.length > 0)
    .sort(
      (a, b) =>
        (b.matched[0]?.tier ?? 0) - (a.matched[0]?.tier ?? 0) ||
        (a.name ?? "").localeCompare(b.name ?? "")
    );

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div>
        <h1 className="font-display text-4xl font-extrabold">
          Search students
        </h1>
        <p className="mt-2 max-w-xl">
          Pick a skill and a minimum badge level. Gold means the student passed
          the test. Verified means their certificate was checked.
        </p>
      </div>

      <SearchFilters
        skills={skills ?? []}
        initial={{
          skill: params.skill ?? "",
          tier: String(minTier),
          q: params.q ?? "",
        }}
      />

      <p className="text-sm font-semibold">
        {results.length} {results.length === 1 ? "student" : "students"} found
      </p>

      {results.length === 0 ? (
        <div className="card p-6">
          <p>
            No students match these filters. Try a lower badge level, another
            skill, or clear the search.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => {
            const matchedIds = new Set(r.matched.map((m) => m.skill_id));
            return (
              <div key={r.id} className="card flex flex-col gap-4 p-5">
                <div>
                  <h3 className="font-display text-lg font-bold">
                    {r.name ?? "Unnamed student"}
                  </h3>
                  <p className="text-sm">{r.college ?? "College not set"}</p>
                </div>

                <ul className="flex flex-wrap gap-2">
                  {r.list.map((s) => (
                    <li
                      key={s.skill_id}
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 ${
                        filtering && matchedIds.has(s.skill_id)
                          ? "border-primary bg-primary/10"
                          : "border-line"
                      }`}
                    >
                      <span className="text-sm font-semibold">
                        {nameById[s.skill_id] ?? "Unknown skill"}
                      </span>
                      <SkillBadge tier={s.tier} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}