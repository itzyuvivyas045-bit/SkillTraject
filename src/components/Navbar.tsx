import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <nav className="flex items-center justify-between border-b border-gray-700 px-6 py-3">
      <Link href="/" className="text-lg font-bold">
        SkillTraject
      </Link>

      <div className="flex items-center gap-4">
        {profile ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <span className="text-sm text-gray-400">
              {profile.full_name} · {profile.role}
            </span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/signup" className="rounded bg-blue-600 px-3 py-1.5">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}