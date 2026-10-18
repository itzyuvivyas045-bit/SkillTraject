"use client";

const THEMES = [
  { id: "clean", label: "Clean", color: "#4f46e5" },
  { id: "dark", label: "Dark", color: "#0b0f1a" },
  { id: "soft", label: "Soft", color: "#ec4899" },
];

export default function ThemeSwitcher() {
  function choose(id: string) {
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem("theme", id);
    } catch {}
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Choose theme">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          title={`${t.label} theme`}
          aria-label={`${t.label} theme`}
          data-theme-btn={t.id}
          onClick={() => choose(t.id)}
          className="theme-dot"
          style={{ background: t.color }}
        />
      ))}
    </div>
  );
}