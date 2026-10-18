import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SkillExplorer from "@/components/SkillExplorer";

export default async function SkillsPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const [{ data: skills }, { data: mine }] = await Promise.all([
    supabase.from("skills").select("id, name, category").order("name"),
    supabase
      .from("student_skills")
      .select("skill_id, trust_tier")
      .eq("student_id", profile.id),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Skills</h1>
        <p className="mt-2 max-w-xl">
          Add the skills you have. Each one starts as Listed until you prove it.
        </p>
      </div>
      <SkillExplorer
        userId={profile.id}
        skills={skills ?? []}
        initialMine={mine ?? []}
      />
    </main>
  );
}