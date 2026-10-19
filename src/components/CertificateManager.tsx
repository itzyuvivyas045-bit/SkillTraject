"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Cert = {
  id: number;
  skill_id: number;
  skill_name: string;
  file_url: string;
  file_name: string | null;
  status: string;
};

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/png", "image/jpeg"];

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-mist",
  verified: "bg-mint",
  rejected: "bg-coral",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending review",
  verified: "Verified",
  rejected: "Rejected",
};

export default function CertificateManager({
  userId,
  mySkills,
  initialCerts,
}: {
  userId: string;
  mySkills: { id: number; name: string }[];
  initialCerts: Cert[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [skillId, setSkillId] = useState<number | "">(mySkills[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!skillId || !file) {
      setMessage({ type: "error", text: "Choose a skill and a file first." });
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      setMessage({ type: "error", text: "Only PDF, PNG or JPG files are allowed." });
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage({ type: "error", text: "That file is larger than 5 MB." });
      return;
    }

    setUploading(true);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${skillId}-${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(path, file);

    if (uploadError) {
      setMessage({ type: "error", text: uploadError.message });
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from("certificates").insert({
      student_id: userId,
      skill_id: skillId,
      file_url: path,
      file_name: file.name,
      status: "pending",
    });

    if (dbError) {
      await supabase.storage.from("certificates").remove([path]);
      setMessage({ type: "error", text: dbError.message });
      setUploading(false);
      return;
    }

    setFile(null);
    setInputKey((k) => k + 1);
    setMessage({ type: "ok", text: "Uploaded. It's now waiting for review." });
    setUploading(false);
    router.refresh();
  }

  async function view(path: string) {
    const { data, error } = await supabase.storage
      .from("certificates")
      .createSignedUrl(path, 60);

    if (error || !data) {
      setMessage({ type: "error", text: error?.message ?? "Couldn't open the file." });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function remove(c: Cert) {
    if (!confirm("Delete this certificate?")) return;
    setMessage(null);

    const { error } = await supabase
      .from("certificates")
      .delete()
      .eq("id", c.id);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    await supabase.storage.from("certificates").remove([c.file_url]);
    router.refresh();
  }

  if (mySkills.length === 0) {
    return (
      <div className="card space-y-4 p-6">
        <p>
          Certificates are attached to a skill, and you haven't added any skills
          yet.
        </p>
        <Link href="/student/skills" className="btn btn-primary">
          Add a skill first
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleUpload} className="card max-w-lg space-y-5 p-6">
        <h2 className="font-display text-xl font-bold">Upload a certificate</h2>

        <div>
          <label htmlFor="skill" className="mb-1 block text-sm font-semibold">
            Skill
          </label>
          <select
            id="skill"
            className="input"
            value={skillId}
            onChange={(e) => setSkillId(Number(e.target.value))}
          >
            {mySkills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="file" className="mb-1 block text-sm font-semibold">
            File (PDF, PNG or JPG, up to 5 MB)
          </label>
          <input
            key={inputKey}
            id="file"
            type="file"
            accept=".pdf,image/png,image/jpeg"
            className="input"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {message && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={`rounded-lg border border-line px-3 py-2 text-sm ${
              message.type === "ok" ? "bg-mint/30" : "bg-coral/20"
            }`}
          >
            {message.text}
          </p>
        )}

        <button type="submit" disabled={uploading} className="btn btn-primary">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">Your certificates</h2>

        {initialCerts.length === 0 ? (
          <div className="card p-6">
            <p>Nothing uploaded yet.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {initialCerts.map((c) => (
              <div key={c.id} className="card flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold">
                      {c.skill_name}
                    </h3>
                    <p className="truncate text-sm">
                      {c.file_name ?? "Certificate"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold ${
                      STATUS_STYLE[c.status] ?? "bg-mist"
                    }`}
                  >
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => view(c.file_url)} className="btn btn-ghost">
                    View
                  </button>
                  {c.status === "pending" && (
                    <button onClick={() => remove(c)} className="btn btn-ghost">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}