"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Item = {
  id: number;
  file_url: string;
  file_name: string | null;
  student_name: string;
  college: string | null;
  skill_name: string;
};

export default function ReviewQueue({ items }: { items: Item[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function view(path: string) {
    setError("");
    const { data, error } = await supabase.storage
      .from("certificates")
      .createSignedUrl(path, 60);

    if (error || !data) {
      setError(error?.message ?? "Couldn't open the file.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function review(id: number, approve: boolean) {
    setBusy(id);
    setError("");

    const { error } = await supabase.rpc("review_certificate", {
      cert_id: id,
      approve,
    });

    if (error) {
      setError(error.message);
    } else {
      router.refresh();
    }
    setBusy(null);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm font-semibold">
        {items.length} waiting for review
      </p>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-line bg-coral/20 px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <div className="card p-6">
          <p>The queue is empty. New uploads will show up here.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.id} className="card flex flex-col gap-4 p-5">
              <div>
                <h3 className="font-display text-lg font-bold">
                  {i.skill_name}
                </h3>
                <p className="font-semibold">{i.student_name}</p>
                <p className="text-sm">{i.college ?? "College not set"}</p>
                <p className="mt-1 truncate text-sm">
                  {i.file_name ?? "Certificate"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => view(i.file_url)} className="btn btn-ghost">
                  View
                </button>
                <button
                  onClick={() => review(i.id, true)}
                  disabled={busy === i.id}
                  className="btn bg-mint"
                >
                  Approve
                </button>
                <button
                  onClick={() => review(i.id, false)}
                  disabled={busy === i.id}
                  className="btn bg-coral"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}