"use client";

import { useState } from "react";

const SKILLS = ["Python", "React", "SQL"];

const TIERS = [
  {
    label: "Listed",
    glyph: "?",
    note: "You added the skill. Nobody has checked it yet.",
    bg: "bg-mist",
  },
  {
    label: "Verified",
    glyph: "✓",
    note: "Your certificate was checked. A tick shows next to the skill.",
    bg: "bg-mint",
  },
  {
    label: "Gold",
    glyph: "★",
    note: "You passed the test. Companies can now filter for gold skills.",
    bg: "bg-gold",
  },
];

export default function TrustLadder() {
  const [skill, setSkill] = useState("Python");
  const [tier, setTier] = useState(0);

  const current = TIERS[tier];
  const action =
    tier === 0 ? "Upload certificate" : tier === 1 ? "Pass the test" : "Start over";

  function pickSkill(s: string) {
    setSkill(s);
    setTier(0);
  }

  return (
    <div className="card w-full max-w-md p-6">
      <div className="mb-6 flex flex-wrap gap-2">
        {SKILLS.map((s) => (
          <button
            key={s}
            onClick={() => pickSkill(s)}
            className={`chip ${s === skill ? "chip-active" : ""}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div
          key={`${skill}-${tier}`}
          className={`pop grid h-16 w-16 place-items-center rounded-2xl border-2 border-ink font-display text-2xl font-extrabold ${current.bg}`}
        >
          {current.glyph}
        </div>
        <div>
          <p className="font-display text-2xl font-bold">{skill}</p>
          <p className="text-sm font-semibold">{current.label}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2" aria-hidden="true">
        {TIERS.map((t, i) => (
          <div
            key={t.label}
            className={`h-3 flex-1 rounded-full border-2 border-ink transition-colors duration-300 ${
              i <= tier ? t.bg : "bg-white"
            }`}
          />
        ))}
      </div>

      <p className="min-h-12 text-sm" aria-live="polite">
        {current.note}
      </p>

      <button
        onClick={() => setTier(tier === 2 ? 0 : tier + 1)}
        className="btn btn-primary mt-4 w-full"
      >
        {action}
      </button>
    </div>
  );
}