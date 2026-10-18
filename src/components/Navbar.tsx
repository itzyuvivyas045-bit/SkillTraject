import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import ThemeSwitcher from "./ThemeSwitcher";

export default async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <nav className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold font-bold">
            ★
          </span>
          <span className="font-display text-lg font-extrabold">
            SkillTraject
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {profile ? (
            <>
              <Link href="/dashboard" className="font-semibold hover:underline">
                Dashboard
              </Link>
              <span className="hidden text-sm sm:inline">
                {profile.full_name}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                  profile.role === "company" ? "bg-coral" : "bg-mint"
                }`}
              >
                {profile.role}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="font-semibold hover:underline">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}