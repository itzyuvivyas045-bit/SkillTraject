import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>
        Welcome, <strong>{profile?.full_name}</strong>
      </p>
      <p>
        Role: <strong className="capitalize">{profile?.role}</strong>
      </p>
      <LogoutButton />
    </main>
  );
}