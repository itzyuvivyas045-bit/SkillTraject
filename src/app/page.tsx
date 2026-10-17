import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: skills, error } = await supabase.from("skills").select("*");

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">SkillTraject</h1>
      {error && <p className="text-red-600">Error: {error.message}</p>}
      <ul className="list-disc pl-6">
        {skills?.map((s) => (
          <li key={s.id}>
            {s.name} ({s.category})
          </li>
        ))}
      </ul>
    </main>
  );
}