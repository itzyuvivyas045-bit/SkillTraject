const TIERS = [
  { label: "Listed", glyph: "?", bg: "bg-mist" },
  { label: "Verified", glyph: "✓", bg: "bg-mint" },
  { label: "Gold", glyph: "★", bg: "bg-gold" },
];

export default function SkillBadge({ tier }: { tier: number }) {
  const t = TIERS[tier] ?? TIERS[0];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-0.5 text-sm font-semibold ${t.bg}`}
    >
      <span aria-hidden="true">{t.glyph}</span>
      {t.label}
    </span>
  );
}