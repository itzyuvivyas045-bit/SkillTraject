export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="11" style={{ fill: "var(--t-primary)" }} />
        <path
          d="M9 29Q16 29 21 19.5T32 10"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.9"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="9" cy="29" r="3" fill="#E2E8F0" />
        <circle cx="21" cy="19.5" r="3.5" fill="#6EE7B7" />
        <circle cx="32" cy="10" r="4.5" fill="#FCD34D" />
      </svg>
      <span className="font-display text-lg font-extrabold">
        Skill<span className="text-primary">Traject</span>
      </span>
    </span>
  );
}