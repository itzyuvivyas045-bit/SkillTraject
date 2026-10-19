import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CertificateManager from "@/components/CertificateManager";

export default async function CertificatesPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const [{ data: skills }, { data: mine }, { data: certs }] = await Promise.all([
    supabase.from("skills").select("id, name"),
    supabase
      .from("student_skills")
      .select("skill_id")
      .eq("student_id", profile.id),
    supabase
      .from("certificates")
      .select("id, skill_id, file_url, file_name, status, created_at")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const nameById: Record<number, string> = Object.fromEntries(
    (skills ?? []).map((s) => [s.id, s.name])
  );

  const mySkills = (mine ?? []).map((m) => ({
    id: m.skill_id as number,
    name: nameById[m.skill_id] ?? "Unknown skill",
  }));

  const list = (certs ?? []).map((c) => ({
    id: c.id as number,
    skill_id: c.skill_id as number,
    skill_name: nameById[c.skill_id] ?? "Unknown skill",
    file_url: c.file_url as string,
    file_name: (c.file_name as string | null) ?? null,
    status: c.status as string,
  }));

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Certificates</h1>
        <p className="mt-2 max-w-xl">
          Upload proof for a skill. A reviewer checks it, and once it's
          verified the skill gets a tick.
        </p>
      </div>
      <CertificateManager
        userId={profile.id}
        mySkills={mySkills}
        initialCerts={list}
      />
    </main>
  );
}