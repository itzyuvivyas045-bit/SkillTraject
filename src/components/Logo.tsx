import Image from "next/image";

export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className="rounded-lg"
        priority
      />
      <span className="font-display text-lg font-extrabold">
        Skill<span className="text-primary">Traject</span>
      </span>
    </span>
  );
}