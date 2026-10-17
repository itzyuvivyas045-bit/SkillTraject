import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8 text-center">
      <h1 className="text-4xl font-bold">SkillTraject</h1>
      <p className="text-gray-400">
        Verified skills for students. Trusted talent for companies.
      </p>
      <Link href="/signup" className="inline-block rounded bg-blue-600 px-5 py-2">
        Get started
      </Link>
    </main>
  );
}