import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import TestRunner from "@/components/TestRunner";

export default async function TestPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string }>;
}) {
  const profile = await requireRole("student");
  const { skill } = await searchParams;
  const skillId = Number(skill);

  if (!skill || Number.isNaN(skillId)) redirect("/student/tests");

  const supabase = await createClient();

  const [{ data: owned }, { data: skillRow }] = await Promise.all([
    supabase
      .from("student_skills")
      .select("skill_id")
      .eq("student_id", profile.id)
      .eq("skill_id", skillId)
      .maybeSingle(),
    supabase.from("skills").select("name").eq("id", skillId).maybeSingle(),
  ]);

  if (!owned || !skillRow) redirect("/student/tests");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <TestRunner key={skillId} skillId={skillId} skillName={skillRow.name} />
    </main>
  );
}