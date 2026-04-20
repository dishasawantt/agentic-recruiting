export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  summary: string;
  description: string;
  imageSrc: string;
};

export const JOBS: JobListing[] = [
  {
    id: "ml-eng-01",
    title: "Machine Learning Engineer",
    company: "Northwind Labs",
    location: "Remote (US)",
    employmentType: "Full-time",
    imageSrc:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Build and ship production ML systems — PyTorch, data pipelines, and model evaluation alongside product teams.",
    description: `About the role
We're hiring a Machine Learning Engineer to own models from prototype to production. You will partner with product and infra to ship reliable, measurable systems.

What you'll do
- Design, train, and evaluate deep learning models (NLP and tabular) using PyTorch
- Build data pipelines and feature stores; monitor drift and quality in production
- Collaborate on MLOps: CI for models, versioning, and safe rollouts
- Communicate trade-offs clearly to non-ML stakeholders

Requirements
- Strong Python; solid PyTorch or TensorFlow
- Experience shipping ML to production (batch or real-time)
- Comfortable with SQL, basic distributed compute, and REST/gRPC services
- BS+ in CS, ML, or equivalent experience

Nice to have
- Experience with LLMs, RAG, or embedding-based retrieval
- Familiarity with Kubernetes, Terraform, or cloud ML platforms`,
  },
  {
    id: "fullstack-02",
    title: "Senior Full-Stack Engineer",
    company: "Harbor Apps",
    location: "Hybrid — NYC",
    employmentType: "Full-time",
    imageSrc:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    summary:
      "TypeScript, React, and Node across customer-facing apps — ownership from API design to polished UI.",
    description: `About the role
Harbor Apps builds workflow tools for operations teams. As a Senior Full-Stack Engineer, you'll lead features end-to-end on a modern TypeScript stack.

What you'll do
- Implement responsive web apps in React and Next.js
- Design and maintain Node.js APIs, Postgres schemas, and caching layers
- Improve performance, accessibility, and observability
- Mentor peers through code review and lightweight design docs

Requirements
- 5+ years shipping web software; strong TypeScript
- Deep React experience; comfortable with SSR/SSG patterns
- Solid SQL and API design; pragmatic about testing and typing
- Clear written communication for async collaboration

Nice to have
- Experience with Tailwind, Prisma, or similar
- Background in B2B SaaS or high-traffic consumer apps`,
  },
  {
    id: "pm-data-03",
    title: "Product Manager, Data Platform",
    company: "Sterling Analytics",
    location: "Remote (EU / UK)",
    employmentType: "Full-time",
    imageSrc:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Own the roadmap for internal data products — metrics, experimentation, and self-serve analytics for hundreds of users.",
    description: `About the role
Sterling Analytics is scaling its internal data platform. You'll define what we build next for metrics, pipelines, and self-serve tools.

What you'll do
- Discover needs with analytics, growth, and finance partners
- Prioritize roadmap; write crisp PRDs and acceptance criteria
- Work with engineers on delivery, rollout, and adoption metrics
- Align stakeholders on trade-offs between speed, quality, and cost

Requirements
- 4+ years in product management, including data or platform products
- Strong analytical thinking; comfortable in SQL and basic stats
- Experience with experimentation, event tracking, or BI tools
- Excellent facilitation and written communication

Nice to have
- Technical degree or prior engineering experience
- Familiarity with dbt, Snowflake, or similar stack`,
  },
  {
    id: "devops-04",
    title: "DevOps Engineer",
    company: "CloudPeak Systems",
    location: "Remote (Americas)",
    employmentType: "Full-time",
    imageSrc:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Own CI/CD, observability, and cloud infrastructure — Terraform, Kubernetes, and pragmatic reliability practices.",
    description: `About the role
CloudPeak runs multi-tenant SaaS on AWS. You'll keep deploys fast and safe while improving how we observe and recover from incidents.

What you'll do
- Maintain GitHub Actions pipelines, container builds, and release automation
- Operate EKS clusters, networking, and secrets with Terraform and Helm
- Improve logging, metrics, tracing, and on-call runbooks
- Partner with engineering on capacity, cost, and performance trade-offs

Requirements
- 3+ years in DevOps, SRE, or platform engineering
- Strong AWS experience; comfortable with Kubernetes basics
- Terraform or Pulumi; solid bash and one scripting language
- Mindset for documentation and incremental improvement

Nice to have
- Experience with Datadog, Grafana, or OpenTelemetry
- Prior work in regulated or high-availability environments`,
  },
  {
    id: "data-eng-05",
    title: "Data Engineer",
    company: "Meridian Health",
    location: "Hybrid — Boston",
    employmentType: "Full-time",
    imageSrc:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Build trusted pipelines for clinical and operations data — dbt, Snowflake, and strong data quality standards.",
    description: `About the role
Meridian Health connects care teams with analytics they can trust. Data Engineers turn messy operational feeds into governed datasets.

What you'll do
- Design batch and streaming pipelines with dbt, Airflow, and Snowflake
- Implement tests, contracts, and lineage for critical tables
- Collaborate with analysts and compliance on PHI handling and access patterns
- Tune performance and costs as data volume grows

Requirements
- 4+ years in data engineering or analytics engineering
- Advanced SQL; hands-on dbt or similar transformation tooling
- Experience with a major cloud warehouse (Snowflake, BigQuery, or Redshift)
- Clear written communication with clinical and business partners

Nice to have
- Healthcare interoperability (FHIR, HL7) exposure
- Python for orchestration and light application glue`,
  },
  {
    id: "sec-eng-06",
    title: "Security Engineer",
    company: "Fortress Cyber",
    location: "Remote (US / Canada)",
    employmentType: "Full-time",
    imageSrc:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Harden product and cloud estates — threat modeling, secure SDLC, and hands-on detection for a fast-moving security vendor.",
    description: `About the role
Fortress Cyber ships security products used by mid-market enterprises. You'll embed with product teams to raise the security bar without slowing delivery.

What you'll do
- Lead threat modeling and design reviews for new features and integrations
- Automate security checks in CI; manage findings and exceptions pragmatically
- Tune detection rules, investigate alerts, and improve incident response playbooks
- Advise engineering on authn/z, secrets, and dependency risk

Requirements
- 4+ years in application or cloud security engineering
- Strong understanding of modern web stacks and common vulnerability classes
- Comfortable reading code in TypeScript, Go, or Python
- Excellent judgment under ambiguity; concise documentation

Nice to have
- OSCP, CSSLP, or comparable depth in offensive or defensive security
- Experience with SIEM/SOAR or cloud-native detection tooling`,
  },
  {
    id: "ux-07",
    title: "Product Designer",
    company: "Lumen Studio",
    location: "Remote (EU)",
    employmentType: "Full-time",
    imageSrc:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Shape end-to-end product UX — research, systems thinking, and polished UI in Figma alongside engineers in Europe.",
    description: `About the role
Lumen Studio partners with B2B startups to design clarity-first software. You'll own discovery through delivery on 1–2 products at a time.

What you'll do
- Run lightweight research, map journeys, and define problem statements
- Produce flows, wireframes, and high-fidelity UI with accessible patterns
- Build and maintain design systems; pair with engineers on implementation quality
- Present work clearly to founders and engineering leads

Requirements
- 4+ years in product or UX design for web applications
- Expert Figma skills; familiarity with design tokens and responsive layouts
- Portfolio showing systems thinking and measurable outcomes
- Comfortable working async across time zones

Nice to have
- Experience with design QA in production web apps
- Motion or prototyping skills for complex workflows`,
  },
  {
    id: "mobile-08",
    title: "Staff Mobile Engineer (iOS)",
    company: "Atlas Mobility",
    location: "Hybrid — SF",
    employmentType: "Full-time",
    imageSrc:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Lead SwiftUI architecture for a consumer mobility app — performance, offline mode, and platform excellence at scale.",
    description: `About the role
Atlas Mobility powers daily trips for millions. The iOS app is a flagship surface; you'll set technical direction for the mobile team.

What you'll do
- Architect features in Swift and SwiftUI with testable, modular boundaries
- Improve startup time, memory use, and offline resilience on diverse devices
- Collaborate with Android and backend on APIs, experimentation, and releases
- Mentor engineers through design reviews and pragmatic standards

Requirements
- 6+ years shipping iOS apps; strong Swift and modern UIKit/SwiftUI
- Deep understanding of concurrency, networking, and persistence on iOS
- Experience with CI for iOS, feature flags, and staged rollouts
- User empathy and polish in motion and interaction details

Nice to have
- Background in maps, logistics, or real-time location-heavy products
- Contributions to shared frameworks or open-source iOS tooling`,
  },
];

export function getJob(id: string): JobListing | undefined {
  return JOBS.find((j) => j.id === id);
}
