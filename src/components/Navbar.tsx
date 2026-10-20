import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import Logo from "./Logo";

export default async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <nav className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" aria-label="SkillTraject home">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <Link href="/dashboard" className="font-semibold hover:underline">
                Dashboard
              </Link>
              {profile.is_admin && (
                <Link href="/admin" className="font-semibold hover:underline">
                  Admin
                </Link>
              )}
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