"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ShortlistButton({
  companyId,
  studentId,
  initial,
}: {
  companyId: string;
  studentId: string;
  initial: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true);
    setError("");

    const { error } = saved
      ? await supabase
          .from("shortlists")
          .delete()
          .eq("company_id", companyId)
          .eq("student_id", studentId)
      : await supabase
          .from("shortlists")
          .insert({ company_id: companyId, student_id: studentId });

    if (error) {
      setError(error.message);
    } else {
      setSaved(!saved);
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <button
        onClick={toggle}
        disabled={busy}
        aria-pressed={saved}
        className={`btn ${saved ? "btn-ghost" : "btn-primary"}`}
      >
        {busy ? "Saving..." : saved ? "Remove from shortlist" : "Add to shortlist"}
      </button>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-line bg-coral/20 px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}
    </div>
  );
}