"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  { id: "student", label: "Student", note: "Show skills with proof", on: "bg-mint" },
  { id: "company", label: "Company", note: "Find verified students", on: "bg-coral" },
] as const;

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<"student" | "company">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-6 py-10">
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-5 p-8">
        <h1 className="font-display text-3xl font-extrabold">
          Create your account
        </h1>

        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={role === r.id}
              onClick={() => setRole(r.id)}
              className={`rounded-xl border-2 border-ink p-3 text-left transition ${
                role === r.id
                  ? `${r.on} shadow-[3px_3px_0_var(--color-ink)]`
                  : "bg-white hover:bg-paper"
              }`}
            >
              <span className="block font-display text-lg font-bold">
                {r.label}
              </span>
              <span className="block text-sm">{r.note}</span>
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-semibold">
            {role === "student" ? "Full name" : "Company name"}
          </label>
          <input
            id="name"
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold">
            Password
          </label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border-2 border-ink bg-coral/20 px-3 py-2 text-sm"
          >
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}