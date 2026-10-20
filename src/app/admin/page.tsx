import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ReviewQueue from "@/components/ReviewQueue";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: certs } = await supabase
    .from("certificates")
    .select("id, student_id, skill_id, file_url, file_name, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const studentIds = Array.from(
    new Set((certs ?? []).map((c) => c.student_id as string))
  );

  const [{ data: people }, { data: skills }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, college")
      .in("id", studentIds),
    supabase.from("skills").select("id, name"),
  ]);

  const items = (certs ?? []).map((c) => {
    const person = (people ?? []).find((p) => p.id === c.student_id);
    return {
      id: c.id as number,
      file_url: c.file_url as string,
      file_name: (c.file_name as string | null) ?? null,
      student_name: (person?.full_name as string | null) ?? "Unknown student",
      college: (person?.college as string | null) ?? null,
      skill_name:
        (skills ?? []).find((s) => s.id === c.skill_id)?.name ??
        "Unknown skill",
    };
  });

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Review queue</h1>
        <p className="mt-2 max-w-xl">
          Open each certificate, then approve it to give the student a verified
          skill, or reject it.
        </p>
      </div>
      <ReviewQueue items={items} />
    </main>
  );
}