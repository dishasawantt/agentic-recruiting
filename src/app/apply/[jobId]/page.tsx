import { notFound } from "next/navigation";
import { CandidateScreeningFlow } from "@/components/CandidateScreeningFlow";
import { getJob } from "@/lib/jobs";

type Props = { params: { jobId: string } };

export default function ApplyPage({ params }: Props) {
  const job = getJob(params.jobId);
  if (!job) notFound();

  return (
    <CandidateScreeningFlow
      jobId={job.id}
      jobTitle={`${job.title} — ${job.company}`}
      initialJobDescription={job.description}
      jobMeta={{
        company: job.company,
        location: job.location,
        employmentType: job.employmentType,
        summary: job.summary,
      }}
    />
  );
}
