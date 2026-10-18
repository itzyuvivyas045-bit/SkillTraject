"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({
  userId,
  initialName,
  initialCollege,
}: {
  userId: string;
  initialName: string;
  initialCollege: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(initialName);
  const [college, setCollege] = useState(initialCollege);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, college })
      .eq("id", userId);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "ok", text: "Profile saved." });
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-lg space-y-5 p-8">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold">
          Full name
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
        <label htmlFor="college" className="mb-1 block text-sm font-semibold">
          College
        </label>
        <input
          id="college"
          className="input"
          placeholder="Your college or university"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
        />
      </div>

      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`rounded-lg border-2 border-ink px-3 py-2 text-sm ${
            message.type === "ok" ? "bg-mint/30" : "bg-coral/20"
          }`}
        >
          {message.text}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}