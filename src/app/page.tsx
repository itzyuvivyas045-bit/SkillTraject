import { requireRole } from "@/lib/auth";

const TIERS = [
  { name: "Listed", glyph: "?", note: "Added to your profile, not checked yet.", bg: "bg-mist" },
  { name: "Verified", glyph: "✓", note: "Your certificate was checked.", bg: "bg-mint" },
  { name: "Gold", glyph: "★", note: "You passed the skill test.", bg: "bg-gold" },
];

export default async function StudentHome() {
  const profile = await requireRole("student");
  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <h1 className="font-display text-4xl font-extrabold">Hi, {firstName}</h1>

      <section className="card p-6">
        <h2 className="font-display text-xl font-bold">Your skills</h2>
        <p className="mt-2">
          Nothing here yet. Skills you add will show up with their badge.
        </p>
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