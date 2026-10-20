import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SkillBadge from "@/components/SkillBadge";
import ShortlistButton from "@/components/ShortlistButton";
import ProofLink from "@/components/ProofLink";

export default async function StudentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const company = await requireRole("company");
  const { id } = await params;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("profiles")
    .select("id, full_name, college")
    .eq("id", id)
    .eq("role", "student")
    .maybeSingle();

  if (!student) notFound();

  const [{ data: skills }, { data: statuses }, { data: certs }, { data: saved }] =
    await Promise.all([
      supabase.from("skills").select("id, name"),
      supabase
        .from("skill_status")
        .select("skill_id, tier, gold_expires_at")
        .eq("student_id", id),
      supabase
        .from("certificates")
        .select("id, skill_id, file_url, file_name")
        .eq("student_id", id)
        .eq("status", "verified"),
      supabase
        .from("shortlists")
        .select("student_id")
        .eq("company_id", company.id)
        .eq("student_id", id)
        .maybeSingle(),
    ]);

  const nameById: Record<number, string> = Object.fromEntries(
    (skills ?? []).map((s) => [s.id, s.name])
  );

  const skillList = (statuses ?? [])
    .map((s) => ({
      id: s.skill_id as number,
      tier: s.tier as number,
      name: nameById[s.skill_id] ?? "Unknown skill",
      until:
        s.tier === 2 && s.gold_expires_at
          ? new Date(s.gold_expires_at).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            })
          : null,
    }))
    .sort((a, b) => b.tier - a.tier);

  const proofs = (certs ?? []).map((c) => ({
    id: c.id as number,
    path: c.file_url as string,
    file_name: (c.file_name as string | null) ?? "Certificate",
    skill_name: nameById[c.skill_id] ?? "Unknown skill",
  }));

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <Link href="/company/search" className="text-sm font-semibold hover:underline">
        Back to search
      </Link>

      <section className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">
            {student.full_name ?? "Unnamed student"}
          </h1>
          <p className="mt-1">{student.college ?? "College not set"}</p>
        </div>
        <ShortlistButton
          companyId={company.id}
          studentId={student.id}
          initial={!!saved}
        />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-xl font-bold">Skills</h2>
        {skillList.length === 0 ? (
          <p>This student hasn't added any skills yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {skillList.map((s) => (
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
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">Verified certificates</h2>
        {proofs.length === 0 ? (
          <div className="card p-6">
            <p>No verified certificates yet.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {proofs.map((p) => (
              <div key={p.id} className="card flex flex-col gap-3 p-5">
                <div>
                  <h3 className="font-display text-lg font-bold">
                    {p.skill_name}
                  </h3>
                  <p className="truncate text-sm">{p.file_name}</p>
                </div>
                <ProofLink path={p.path} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}