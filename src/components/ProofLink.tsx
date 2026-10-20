"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProofLink({ path }: { path: string }) {
  const supabase = createClient();
  const [error, setError] = useState("");

  async function open() {
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

  return (
    <div className="space-y-2">
      <button onClick={open} className="btn btn-ghost">
        View certificate
      </button>
      {error && (
        <p role="alert" className="text-sm">
          {error}
        </p>
      )}
    </div>
  );
}