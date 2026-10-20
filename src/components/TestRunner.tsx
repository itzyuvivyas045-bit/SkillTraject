"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Question = { q_id: number; q_text: string; q_options: string[] };
type Result = {
  score: number;
  total: number;
  passed: boolean;
  pass_mark: number;
};

const SECONDS = 300;

export default function TestRunner({
  skillId,
  skillName,
}: {
  skillId: number;
  skillName: string;
}) {
  const supabase = createClient();

  const [phase, setPhase] = useState<"intro" | "running" | "result">("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.rpc("get_test_questions", {
      p_skill_id: skillId,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (!data || data.length === 0) {
      setError("No questions are available for this skill yet.");
      return;
    }

    setQuestions(data as Question[]);
    setAnswers({});
    setCurrent(0);
    setSecondsLeft(SECONDS);
    setPhase("running");
  }

  async function submit() {
    if (loading) return;
    setLoading(true);
    setError("");

    const payload = questions.map((q) => ({
      q: q.q_id,
      a: answers[q.q_id] ?? -1,
    }));

    const { data, error } = await supabase.rpc("submit_test", {
      p_skill_id: skillId,
      p_answers: payload,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setResult(data as Result);
    setPhase("result");
  }

  useEffect(() => {
    if (phase !== "running") return;

    if (secondsLeft <= 0) {
      void submit();
      return;
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  if (phase === "intro") {
    return (
      <div className="card space-y-5 p-8">
        <h1 className="font-display text-3xl font-extrabold">{skillName} test</h1>
        <ul className="list-disc space-y-1 pl-5">
          <li>5 questions, picked at random</li>
          <li>5 minutes on the clock</li>
          <li>4 correct answers earns a gold badge</li>
          <li>If you miss, you can retry after a couple of minutes</li>
        </ul>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-line bg-coral/20 px-3 py-2 text-sm"
          >
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button onClick={start} disabled={loading} className="btn btn-primary">
            {loading ? "Loading..." : "Start test"}
          </button>
          <Link href="/student/tests" className="btn btn-ghost">
            Back
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="card space-y-5 p-8 text-center">
        <div
          className={`pop mx-auto grid h-24 w-24 place-items-center rounded-3xl font-display text-5xl font-extrabold ${
            result.passed ? "bg-gold" : "bg-mist"
          }`}
        >
          {result.passed ? "★" : "✗"}
        </div>

        <h1 className="font-display text-3xl font-extrabold">
          {result.passed ? "Gold badge earned" : "Not this time"}
        </h1>

        <p>
          You got {result.score} of {result.total}.{" "}
          {result.passed
            ? `${skillName} now shows a gold badge on your profile.`
            : `You needed ${result.pass_mark} to pass. You can try again in a couple of minutes.`}
        </p>

        <div className="flex justify-center gap-3">
          <Link href="/student/tests" className="btn btn-primary">
            Back to tests
          </Link>
          <Link href="/student" className="btn btn-ghost">
            My overview
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const answered = Object.keys(answers).length;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="card space-y-6 p-8">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          Question {current + 1} of {questions.length}
        </p>
        <p className="font-display text-lg font-bold tabular-nums" aria-live="off">
          {mm}:{ss}
        </p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-mist">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <h2 className="font-display text-2xl font-bold">{q.q_text}</h2>

      <div className="space-y-3">
        {q.q_options.map((opt, i) => {
          const selected = answers[q.q_id] === i;
          return (
            <button
              key={i}
              type="button"
              aria-pressed={selected}
              onClick={() => setAnswers((a) => ({ ...a, [q.q_id]: i }))}
              className={`w-full rounded-xl border p-3 text-left font-medium transition ${
                selected
                  ? "border-primary bg-primary/15"
                  : "border-line bg-surface hover:bg-mist"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-line bg-coral/20 px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
          className="btn btn-ghost"
        >
          Back
        </button>

        <p className="text-sm">
          {answered} of {questions.length} answered
        </p>

        {isLast ? (
          <button onClick={submit} disabled={loading} className="btn btn-primary">
            {loading ? "Submitting..." : "Submit test"}
          </button>
        ) : (
          <button onClick={() => setCurrent((c) => c + 1)} className="btn btn-primary">
            Next
          </button>
        )}
      </div>
    </div>
  );
}