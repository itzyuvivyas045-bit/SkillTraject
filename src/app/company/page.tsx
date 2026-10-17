import { requireRole } from "@/lib/auth";

const TIERS = [
  { name: "Listed", glyph: "?", note: "The student says they have this skill.", bg: "bg-mist" },
  { name: "Verified", glyph: "✓", note: "Their certificate was checked.", bg: "bg-mint" },
  { name: "Gold", glyph: "★", note: "They passed the skill test.", bg: "bg-gold" },
];

export default async function CompanyHome() {
  const profile = await requireRole("company");

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <h1 className="font-display text-4xl font-extrabold">
        Welcome, {profile.full_name}
      </h1>

      <section className="card p-6">
        <h2 className="font-display text-xl font-bold">Find students</h2>
        <p className="mt-2">
          Search isn't set up yet. You'll filter students by skill and badge
          level here.
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