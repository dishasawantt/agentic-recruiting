import Image from "next/image";
import Link from "next/link";
import { JOBS } from "@/lib/jobs";

export default function JobsHomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-12 md:px-8">
      <header className="mb-10 md:mb-14">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Open roles
        </h1>
      </header>

      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {JOBS.map((job) => (
          <li key={job.id}>
            <Link
              href={`/apply/${job.id}`}
              className="focus-ring job-card-accent app-card group flex h-full flex-col overflow-hidden p-0 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="relative aspect-[5/3] w-full shrink-0 bg-slate-200">
                <Image
                  src={job.imageSrc}
                  alt={`${job.title} — ${job.company}`}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {job.company}
                </p>
                <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900 group-hover:text-sage-800">
                  {job.title}
                </h2>
                <p className="mt-1 text-[11px] text-slate-400">
                  {job.location} · {job.employmentType}
                </p>
                <p className="mt-4 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {job.summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-sage-700">
                  View
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
