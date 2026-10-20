import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SkillBadge from "@/components/SkillBadge";
import ShortlistButton from "@/components/ShortlistButton";

export default async function ShortlistPage() {
  const company = await requireRole("company");
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("shortlists")
    .select("student_id, created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const ids = (rows ?? []).map((r) => r.student_id as string);

  const [{ data: people }, { data: statuses }, { data: skills }] = ids.length
    ? await Promise.all([
        supabase.from("profiles").select("id, full_name, college").in("id", ids),
        supabase
          .from("skill_status")
          .select("student_id, skill_id, tier")
          .in("student_id", ids),
        supabase.from("skills").select("id, name"),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const nameById: Record<number, string> = Object.fromEntries(
    (skills ?? []).map((s: { id: number; name: string }) => [s.id, s.name])
  );

  const cards = ids.map((sid) => {
    const person = (people ?? []).find((p: { id: string }) => p.id === sid);
    const list = (statuses ?? [])
      .filter((s: { student_id: string }) => s.student_id === sid)
      .map((s: { skill_id: number; tier: number }) => ({
        skill_id: s.skill_id,
        tier: s.tier,
      }))
      .sort((a: { tier: number }, b: { tier: number }) => b.tier - a.tier);

    return {
      id: sid,
      name: (person?.full_name as string | null) ?? "Unnamed student",
      college: (person?.college as string | null) ?? null,
      list,
    };
  });

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Shortlist</h1>
        <p className="mt-2 max-w-xl">Students you've saved to come back to.</p>
      </div>

      <p className="text-sm font-semibold">
        {cards.length} {cards.length === 1 ? "student" : "students"} saved
      </p>

      {cards.length === 0 ? (
        <div className="card space-y-4 p-6">
          <p>Your shortlist is empty. Save students from their profile page.</p>
          <Link href="/company/search" className="btn btn-primary">
            Search students
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.id} className="card flex flex-col gap-4 p-5">
              <div>
                <h3 className="font-display text-lg font-bold">{c.name}</h3>
                <p className="text-sm">{c.college ?? "College not set"}</p>
              </div>

              <ul className="flex flex-wrap gap-2">
                {c.list.map((s: { skill_id: number; tier: number }) => (
                  <li
                    key={s.skill_id}
                    className="flex items-center gap-2 rounded-xl border border-line px-2.5 py-1.5"
                  >
                    <span className="text-sm font-semibold">
                      {nameById[s.skill_id] ?? "Unknown skill"}
                    </span>
                    <SkillBadge tier={s.tier} />
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                <Link href={`/company/students/${c.id}`} className="btn btn-ghost">
                  View profile
                </Link>
              </div>

              <ShortlistButton
                companyId={company.id}
                studentId={c.id}
                initial={true}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}