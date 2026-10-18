import { requireRole } from "@/lib/auth";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const profile = await requireRole("student");

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <h1 className="font-display text-4xl font-extrabold">Profile</h1>
      <ProfileForm
        userId={profile.id}
        initialName={profile.full_name ?? ""}
        initialCollege={profile.college ?? ""}
      />
    </main>
  );
}