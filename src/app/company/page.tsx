import { requireRole } from "@/lib/auth";

export default async function CompanyHome() {
  const profile = await requireRole("company");

  return (
    <main className="space-y-4 p-8">
      <h1 className="text-3xl font-bold">Company dashboard</h1>
      <p>Welcome, {profile.full_name}</p>
    </main>
  );
}