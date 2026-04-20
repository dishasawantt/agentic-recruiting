export type DemoRankingBar = { label: string; value: number };

export type DemoFitAnalysis = {
  gaugeScore: number;
  semanticLayerPct: number;
  skillsPct: number;
  experiencePct: number;
  impactPct: number;
  jdFitPct: number;
  strengthsPct: number;
  strengths: string[];
  gaps: string[];
  recommendationLabel: string;
  interviewProbes: string[];
};

export type DemoIdealCandidate = {
  id: string;
  avatarUrl: string;
  name: string;
  roleTitle: string;
  location: string;
  overall: number;
  rankingBars: DemoRankingBar[];
  applicationRef: string;
  educationLine: string;
  skillTags: string[];
  bioSnippet: string;
  fitAnalysis: DemoFitAnalysis;
};

export type DemoRankingBundle = {
  candidates: DemoIdealCandidate[];
  groupStrengths: string[];
  groupInterviewTips: string[];
};

const ML: DemoRankingBundle = {
  candidates: [
    {
      id: "demo-ml-alyssa",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      name: "Alyssa Martin",
      roleTitle: "Data Scientist",
      location: "Remote",
      overall: 89,
      applicationRef: "ML Application Post · 0234",
      educationLine: "Master's in Computer Science · Stanford · 2018",
      rankingBars: [
        { label: "Experience", value: 90 },
        { label: "Skills", value: 95 },
        { label: "Impact", value: 87 },
        { label: "JD fit", value: 85 },
      ],
      skillTags: ["Python", "TensorFlow", "SQL", "LLMs", "Kubeflow"],
      bioSnippet:
        "6+ years building ML systems in production; led model lifecycle from research to deployment.",
      fitAnalysis: {
        gaugeScore: 85,
        semanticLayerPct: 85,
        skillsPct: 92,
        experiencePct: 90,
        impactPct: 87,
        jdFitPct: 85,
        strengthsPct: 89,
        strengths: [
          "Strong solid foundation in ML fundamentals and experimentation.",
          "Familiarity with PyTorch and production monitoring patterns.",
        ],
        gaps: [
          "Limited exposure to large-scale system design.",
          "Has not worked on production APIs at scale.",
        ],
        recommendationLabel: "STRONG HIRE",
        interviewProbes: [
          "For the interview: Ask about API design experience.",
          "Probe depth on embedding pipelines and evaluation metrics.",
        ],
      },
    },
    {
      id: "demo-ml-mark",
      avatarUrl: "https://randomuser.me/api/portraits/men/51.jpg",
      name: "Mark Thompson",
      roleTitle: "Data Engineer",
      location: "Austin, TX",
      overall: 84,
      applicationRef: "ML Application Post · 0235",
      educationLine: "BS Computer Engineering · UT Austin · 2015",
      rankingBars: [
        { label: "Experience", value: 98 },
        { label: "Skills", value: 95 },
        { label: "Impact", value: 85 },
        { label: "JD fit", value: 92 },
      ],
      skillTags: ["Spark", "Airflow", "Python", "Kafka", "Snowflake"],
      bioSnippet:
        "8 yrs data platforms; partners with ML on features, batch inference, and data quality.",
      fitAnalysis: {
        gaugeScore: 84,
        semanticLayerPct: 80,
        skillsPct: 88,
        experiencePct: 96,
        impactPct: 83,
        jdFitPct: 91,
        strengthsPct: 86,
        strengths: [
          "Elite data pipeline ownership and JD alignment on production ML support.",
          "Strong SQL, streaming, and orchestration experience.",
        ],
        gaps: [
          "Less hands-on with model training and offline experimentation.",
          "Deep learning research depth is thinner than pure ML engineers.",
        ],
        recommendationLabel: "HIRE",
        interviewProbes: [
          "For the interview: Ask about feature store contracts with ML consumers.",
          "Ask how they’d harden training data for drift.",
        ],
      },
    },
    {
      id: "demo-ml-disha",
      avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
      name: "Disha Sawant",
      roleTitle: "ML Engineer",
      location: "San Jose, CA",
      overall: 81,
      applicationRef: "ML Application Post · 0236",
      educationLine: "BS Computer Science · SJSU · 2019",
      rankingBars: [
        { label: "Semantic layer", value: 99 },
        { label: "Skills", value: 82 },
        { label: "Impact", value: 87 },
        { label: "JD fit", value: 85 },
      ],
      skillTags: ["PyTorch", "Python", "CUDA", "Kubernetes", "ONNX"],
      bioSnippet:
        "ML infra and serving focus; low-latency inference, versioning, and safe production rollouts.",
      fitAnalysis: {
        gaugeScore: 81,
        semanticLayerPct: 99,
        skillsPct: 82,
        experiencePct: 76,
        impactPct: 79,
        jdFitPct: 81,
        strengthsPct: 83,
        strengths: [
          "Outstanding semantic fit with the role narrative and responsibilities.",
          "Strong shipping discipline for inference, canaries, and rollbacks.",
        ],
        gaps: [
          "Skills breadth in data engineering is mid vs pipeline-heavy peers.",
          "Stakeholder storytelling for non-technical audiences can deepen.",
        ],
        recommendationLabel: "HIRE",
        interviewProbes: [
          "For the interview: Ask about inference SLOs and latency trade-offs.",
          "Probe experience with bad rollouts and process changes.",
        ],
      },
    },
    {
      id: "demo-ml-james",
      avatarUrl: "https://randomuser.me/api/portraits/men/14.jpg",
      name: "James Chen",
      roleTitle: "Applied Scientist",
      location: "Seattle, WA",
      overall: 79,
      applicationRef: "ML Application Post · 0237",
      educationLine: "PhD Statistics · UW · 2020",
      rankingBars: [
        { label: "Experience", value: 76 },
        { label: "Skills", value: 88 },
        { label: "Impact", value: 80 },
        { label: "JD fit", value: 78 },
      ],
      skillTags: ["PyTorch", "R", "Causal inference", "Spark", "SQL"],
      bioSnippet:
        "Research-to-production for ranking and personalization; strong experimentation design.",
      fitAnalysis: {
        gaugeScore: 79,
        semanticLayerPct: 82,
        skillsPct: 88,
        experiencePct: 76,
        impactPct: 80,
        jdFitPct: 78,
        strengthsPct: 80,
        strengths: ["Strong stats and offline evaluation rigor."],
        gaps: ["Less ownership of large online serving systems."],
        recommendationLabel: "HIRE",
        interviewProbes: ["Ask about uplift modeling and guardrails."],
      },
    },
    {
      id: "demo-ml-sarah",
      avatarUrl: "https://randomuser.me/api/portraits/women/36.jpg",
      name: "Sarah Okonkwo",
      roleTitle: "ML Research Engineer",
      location: "Boston, MA",
      overall: 77,
      applicationRef: "ML Application Post · 0238",
      educationLine: "MS EECS · MIT · 2019",
      rankingBars: [
        { label: "Semantic layer", value: 94 },
        { label: "Skills", value: 79 },
        { label: "Impact", value: 74 },
        { label: "JD fit", value: 76 },
      ],
      skillTags: ["JAX", "Python", "Triton", "CUDA", "Papers"],
      bioSnippet:
        "Publications in representation learning; moving toward applied deployment teams.",
      fitAnalysis: {
        gaugeScore: 77,
        semanticLayerPct: 94,
        skillsPct: 79,
        experiencePct: 72,
        impactPct: 74,
        jdFitPct: 76,
        strengthsPct: 78,
        strengths: ["Excellent research depth and novelty."],
        gaps: ["Production SLAs and on-call experience still building."],
        recommendationLabel: "MAYBE",
        interviewProbes: ["Probe appetite for product-paced delivery."],
      },
    },
    {
      id: "demo-ml-wei",
      avatarUrl: "https://randomuser.me/api/portraits/men/25.jpg",
      name: "Wei Zhang",
      roleTitle: "Staff ML Engineer",
      location: "Toronto, ON",
      overall: 86,
      applicationRef: "ML Application Post · 0239",
      educationLine: "MS CS · Waterloo · 2012",
      rankingBars: [
        { label: "Experience", value: 94 },
        { label: "Skills", value: 86 },
        { label: "Impact", value: 88 },
        { label: "JD fit", value: 84 },
      ],
      skillTags: ["Python", "K8s", "Ray", "Feature stores", "GCP"],
      bioSnippet:
        "Led model platform for ads; cost-aware training and multi-region inference.",
      fitAnalysis: {
        gaugeScore: 86,
        semanticLayerPct: 88,
        skillsPct: 86,
        experiencePct: 94,
        impactPct: 88,
        jdFitPct: 84,
        strengthsPct: 87,
        strengths: ["Staff-level scope on ML platform and reliability."],
        gaps: ["Less recent hands-on with latest LLM fine-tuning stacks."],
        recommendationLabel: "STRONG HIRE",
        interviewProbes: ["Ask about cost-per-inference optimization."],
      },
    },
  ],
  groupStrengths: [
    "They have a solid foundation in ML and data systems across modeling, platforms, and serving.",
    "The pool spans research, applied science, platform, and data-engineering-adjacent profiles.",
    "JD fit and impact signals sit above the bar for this level and scope.",
  ],
  groupInterviewTips: [
    "For the interview: Ask about API design experience.",
    "For the interview: Ask Mark to whiteboard a feature pipeline with an ML consumer.",
    "For the interview: Ask Disha about canary deploys and inference monitoring.",
    "Probe each candidate on cross-functional ownership and roadmap influence.",
    "Use Wei for platform depth; Sarah for research-to-prod risk; James for experimentation.",
  ],
};

const FULLSTACK: DemoRankingBundle = {
  candidates: [
    {
      id: "demo-fs-jordan",
      avatarUrl: "https://randomuser.me/api/portraits/men/43.jpg",
      name: "Jordan Lee",
      roleTitle: "Staff Software Engineer",
      location: "New York, NY",
      overall: 88,
      applicationRef: "Engineering Application Post · 0441",
      educationLine: "MS Software Engineering · Columbia · 2014",
      rankingBars: [
        { label: "Experience", value: 92 },
        { label: "Skills", value: 94 },
        { label: "Impact", value: 86 },
        { label: "JD fit", value: 90 },
      ],
      skillTags: ["TypeScript", "React", "Next.js", "Node.js", "Postgres"],
      bioSnippet:
        "10 yrs B2B SaaS; leads full-stack guild and mentors on API design and web performance.",
      fitAnalysis: {
        gaugeScore: 88,
        semanticLayerPct: 87,
        skillsPct: 94,
        experiencePct: 91,
        impactPct: 86,
        jdFitPct: 90,
        strengthsPct: 89,
        strengths: [
          "Deep alignment with TypeScript, React, and Node ownership expectations.",
          "Proven end-to-end delivery from schema to polished UX.",
        ],
        gaps: [
          "Less public evidence on ultra-high-traffic consumer scale.",
          "Some newer ORM patterns are still ramping vs raw SQL strength.",
        ],
        recommendationLabel: "STRONG HIRE",
        interviewProbes: [
          "For the interview: Ask about SSR vs CSR trade-offs on a real feature.",
          "Ask how they structure API versioning for partners.",
        ],
      },
    },
    {
      id: "demo-fs-priya",
      avatarUrl: "https://randomuser.me/api/portraits/women/31.jpg",
      name: "Priya Shah",
      roleTitle: "Engineering Lead, Web",
      location: "Remote (US)",
      overall: 85,
      applicationRef: "Engineering Application Post · 0442",
      educationLine: "BS Computer Science · Georgia Tech · 2016",
      rankingBars: [
        { label: "Experience", value: 88 },
        { label: "Skills", value: 90 },
        { label: "Impact", value: 84 },
        { label: "JD fit", value: 88 },
      ],
      skillTags: ["TypeScript", "React", "Tailwind", "Node", "Redis"],
      bioSnippet:
        "Led typed APIs and a shared component library for a 40-engineer organization.",
      fitAnalysis: {
        gaugeScore: 85,
        semanticLayerPct: 85,
        skillsPct: 90,
        experiencePct: 87,
        impactPct: 84,
        jdFitPct: 88,
        strengthsPct: 86,
        strengths: [
          "Strong mentor signals and accessibility-minded frontend work.",
          "Excellent async communication for distributed teams.",
        ],
        gaps: [
          "Kubernetes ownership is lighter than some staff peers.",
          "Fewer external-facing technical talks or publications.",
        ],
        recommendationLabel: "HIRE",
        interviewProbes: [
          "For the interview: Ask about rolling out a design system safely.",
          "Probe a frontend incident they owned end to end.",
        ],
      },
    },
    {
      id: "demo-fs-alex",
      avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
      name: "Alex Kim",
      roleTitle: "Senior Full-Stack Engineer",
      location: "Brooklyn, NY",
      overall: 82,
      applicationRef: "Engineering Application Post · 0443",
      educationLine: "BA Mathematics · NYU · 2018",
      rankingBars: [
        { label: "Semantic layer", value: 91 },
        { label: "Skills", value: 88 },
        { label: "Impact", value: 80 },
        { label: "JD fit", value: 83 },
      ],
      skillTags: ["React", "TypeScript", "Express", "Postgres", "WebSockets"],
      bioSnippet:
        "6 yrs shipping realtime ops dashboards and billing integrations at growth-stage startups.",
      fitAnalysis: {
        gaugeScore: 82,
        semanticLayerPct: 91,
        skillsPct: 88,
        experiencePct: 84,
        impactPct: 80,
        jdFitPct: 83,
        strengthsPct: 83,
        strengths: [
          "High velocity on React + Node with pragmatic SQL and caching.",
          "Great collaboration with design and PM on vertical slices.",
        ],
        gaps: [
          "Less org-wide technical strategy exposure vs staff peers.",
          "SSR/Next.js depth is still growing toward staff bar.",
        ],
        recommendationLabel: "HIRE",
        interviewProbes: [
          "For the interview: Ask about realtime reliability trade-offs.",
          "Ask for an API redesign story with a migration plan.",
        ],
      },
    },
    {
      id: "demo-fs-morgan",
      avatarUrl: "https://randomuser.me/api/portraits/women/52.jpg",
      name: "Morgan Blake",
      roleTitle: "Principal Frontend Engineer",
      location: "San Francisco, CA",
      overall: 80,
      applicationRef: "Engineering Application Post · 0444",
      educationLine: "BS Design & CS · Stanford · 2011",
      rankingBars: [
        { label: "Experience", value: 86 },
        { label: "Skills", value: 92 },
        { label: "Impact", value: 78 },
        { label: "JD fit", value: 79 },
      ],
      skillTags: ["React", "Web perf", "Design systems", "A11y", "Vite"],
      bioSnippet:
        "Design-system owner for multi-brand SaaS; Core Web Vitals and a11y champion.",
      fitAnalysis: {
        gaugeScore: 80,
        semanticLayerPct: 84,
        skillsPct: 92,
        experiencePct: 86,
        impactPct: 78,
        jdFitPct: 79,
        strengthsPct: 82,
        strengths: ["Elite frontend craft and design partnership."],
        gaps: ["Backend depth is mid vs full-stack bar at principal."],
        recommendationLabel: "HIRE",
        interviewProbes: ["Ask about scaling a design system across squads."],
      },
    },
    {
      id: "demo-fs-chris",
      avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
      name: "Chris O’Neil",
      roleTitle: "Full-Stack Engineer",
      location: "Denver, CO",
      overall: 78,
      applicationRef: "Engineering Application Post · 0445",
      educationLine: "BS CS · CU Boulder · 2019",
      rankingBars: [
        { label: "Semantic layer", value: 84 },
        { label: "Skills", value: 85 },
        { label: "Impact", value: 76 },
        { label: "JD fit", value: 80 },
      ],
      skillTags: ["TypeScript", "NestJS", "Postgres", "React", "Docker"],
      bioSnippet:
        "Product-minded IC shipping CRM integrations and admin tooling end to end.",
      fitAnalysis: {
        gaugeScore: 78,
        semanticLayerPct: 84,
        skillsPct: 85,
        experiencePct: 74,
        impactPct: 76,
        jdFitPct: 80,
        strengthsPct: 79,
        strengths: ["Strong velocity and pragmatic API design."],
        gaps: ["Staff-level influence and mentorship track record is thinner."],
        recommendationLabel: "HIRE",
        interviewProbes: ["Ask about schema migrations under load."],
      },
    },
    {
      id: "demo-fs-lina",
      avatarUrl: "https://randomuser.me/api/portraits/women/18.jpg",
      name: "Lina Morales",
      roleTitle: "Software Engineer II",
      location: "Austin, TX",
      overall: 75,
      applicationRef: "Engineering Application Post · 0446",
      educationLine: "BS Software Eng · UT Austin · 2021",
      rankingBars: [
        { label: "Experience", value: 72 },
        { label: "Skills", value: 84 },
        { label: "Impact", value: 73 },
        { label: "JD fit", value: 77 },
      ],
      skillTags: ["React", "Node", "Jest", "REST", "AWS"],
      bioSnippet:
        "Early-career full-stack; owns features with senior pairing on architecture.",
      fitAnalysis: {
        gaugeScore: 75,
        semanticLayerPct: 78,
        skillsPct: 84,
        experiencePct: 72,
        impactPct: 73,
        jdFitPct: 77,
        strengthsPct: 76,
        strengths: ["Fast learner and solid test discipline."],
        gaps: ["Senior scope and ambiguous ownership still developing."],
        recommendationLabel: "MAYBE",
        interviewProbes: ["Validate senior-level expectations vs growth path."],
      },
    },
  ],
  groupStrengths: [
    "The shortlist strongly matches senior TypeScript, React, and API ownership expectations.",
    "Six profiles span staff IC, lead, senior, and high-growth mid-level execution.",
    "Collective JD fit aligns with B2B workflow and product engineering needs.",
  ],
  groupInterviewTips: [
    "For the interview: Ask Jordan about scaling engineering standards.",
    "For the interview: Ask Priya about cross-team migrations.",
    "For the interview: Ask Alex about realtime data and failure modes.",
    "Validate Postgres and caching instincts with a short schema exercise.",
    "Use Morgan for UX craft; Chris for API breadth; Lina for growth trajectory.",
  ],
};

const PM_DATA: DemoRankingBundle = {
  candidates: [
    {
      id: "demo-pm-noah",
      avatarUrl: "https://randomuser.me/api/portraits/men/59.jpg",
      name: "Noah Patel",
      roleTitle: "Senior PM, Data Products",
      location: "London, UK",
      overall: 90,
      applicationRef: "Product Application Post · 0612",
      educationLine: "MBA · INSEAD · 2016 · BSc Physics · Imperial",
      rankingBars: [
        { label: "Experience", value: 91 },
        { label: "Skills", value: 88 },
        { label: "Impact", value: 92 },
        { label: "JD fit", value: 93 },
      ],
      skillTags: ["SQL", "Experimentation", "Snowflake", "Roadmapping", "PRDs"],
      bioSnippet:
        "7 yrs PM; owned internal metrics for 200+ stakeholders; strong SQL and experimentation.",
      fitAnalysis: {
        gaugeScore: 90,
        semanticLayerPct: 89,
        skillsPct: 88,
        experiencePct: 91,
        impactPct: 92,
        jdFitPct: 93,
        strengthsPct: 91,
        strengths: [
          "Excellent fit for data platform roadmap and prioritization.",
          "Credible partner to analysts and engineers on delivery.",
        ],
        gaps: [
          "dbt-specific depth is adjacent rather than primary.",
          "EU timezone may need overlap planning with US engineering hubs.",
        ],
        recommendationLabel: "STRONG HIRE",
        interviewProbes: [
          "For the interview: Ask how they choose build vs buy for metrics.",
          "Probe roadmap conflicts between finance and product analytics.",
        ],
      },
    },
    {
      id: "demo-pm-emma",
      avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg",
      name: "Emma Wilson",
      roleTitle: "Technical Program Manager",
      location: "Berlin, DE",
      overall: 86,
      applicationRef: "Product Application Post · 0613",
      educationLine: "MS Information Systems · TU Berlin · 2015",
      rankingBars: [
        { label: "Experience", value: 89 },
        { label: "Skills", value: 85 },
        { label: "Impact", value: 88 },
        { label: "JD fit", value: 87 },
      ],
      skillTags: ["Data platforms", "Agile", "SQL", "OKRs", "Rollouts"],
      bioSnippet:
        "TPM on data lake migrations; partners with PMs on sequencing, risk, and comms.",
      fitAnalysis: {
        gaugeScore: 86,
        semanticLayerPct: 84,
        skillsPct: 85,
        experiencePct: 88,
        impactPct: 88,
        jdFitPct: 87,
        strengthsPct: 87,
        strengths: [
          "Strong delivery rigor and cross-functional facilitation.",
          "Comfortable with SQL, pipelines concepts, and rollout planning.",
        ],
        gaps: [
          "Discovery-heavy PM craft is thinner than Noah’s profile.",
          "Less sole ownership of net-new PRDs for greenfield bets.",
        ],
        recommendationLabel: "HIRE",
        interviewProbes: [
          "For the interview: Ask about de-risking a warehouse cutover.",
          "Ask about misaligned KPIs across teams.",
        ],
      },
    },
    {
      id: "demo-pm-sofia",
      avatarUrl: "https://randomuser.me/api/portraits/women/50.jpg",
      name: "Sofia Rossi",
      roleTitle: "Product Manager, Analytics",
      location: "Remote (EU)",
      overall: 83,
      applicationRef: "Product Application Post · 0614",
      educationLine: "BA Economics · Bocconi · 2017",
      rankingBars: [
        { label: "Semantic layer", value: 93 },
        { label: "Skills", value: 86 },
        { label: "Impact", value: 82 },
        { label: "JD fit", value: 85 },
      ],
      skillTags: ["BI tools", "SQL", "User research", "A/B tests", "Looker"],
      bioSnippet:
        "5 yrs; launched self-serve dashboards for GTM with strong BI and experimentation basics.",
      fitAnalysis: {
        gaugeScore: 83,
        semanticLayerPct: 93,
        skillsPct: 86,
        experiencePct: 83,
        impactPct: 82,
        jdFitPct: 85,
        strengthsPct: 84,
        strengths: [
          "High semantic fit for internal analytics and adoption goals.",
          "Strong partner to GTM on trustworthy metrics.",
        ],
        gaps: [
          "Stakeholder scale is smaller than the role’s eventual footprint.",
          "Negotiating technical debt with engineering is still developing.",
        ],
        recommendationLabel: "HIRE",
        interviewProbes: [
          "For the interview: Ask how they teach self-serve guardrails.",
          "Probe a failed launch and what they measured next.",
        ],
      },
    },
    {
      id: "demo-pm-daniel",
      avatarUrl: "https://randomuser.me/api/portraits/men/41.jpg",
      name: "Daniel Brooks",
      roleTitle: "PM, Growth Analytics",
      location: "New York, NY",
      overall: 81,
      applicationRef: "Product Application Post · 0615",
      educationLine: "BS Applied Math · NYU · 2014",
      rankingBars: [
        { label: "Experience", value: 84 },
        { label: "Skills", value: 82 },
        { label: "Impact", value: 80 },
        { label: "JD fit", value: 81 },
      ],
      skillTags: ["Experimentation", "SQL", "Funnels", "PRDs", "Amplitude"],
      bioSnippet:
        "Growth PM with strong causal read on experiments; partners tightly with data science.",
      fitAnalysis: {
        gaugeScore: 81,
        semanticLayerPct: 80,
        skillsPct: 82,
        experiencePct: 84,
        impactPct: 80,
        jdFitPct: 81,
        strengthsPct: 81,
        strengths: ["Sharp on metrics design and growth loops."],
        gaps: ["Platform infra trade-offs less central than core PM-data role."],
        recommendationLabel: "HIRE",
        interviewProbes: ["Ask about guarding against peeking and early stops."],
      },
    },
    {
      id: "demo-pm-anika",
      avatarUrl: "https://randomuser.me/api/portraits/women/76.jpg",
      name: "Anika Desai",
      roleTitle: "Group PM, Data Platform",
      location: "Singapore",
      overall: 87,
      applicationRef: "Product Application Post · 0616",
      educationLine: "MBA · NUS · 2012 · BE CS · IIT Bombay",
      rankingBars: [
        { label: "Experience", value: 94 },
        { label: "Skills", value: 86 },
        { label: "Impact", value: 88 },
        { label: "JD fit", value: 86 },
      ],
      skillTags: ["Roadmaps", "Data contracts", "Snowflake", "Stakeholder mgmt", "OKRs"],
      bioSnippet:
        "Group PM for lineage and catalog; scaled data products across three regions.",
      fitAnalysis: {
        gaugeScore: 87,
        semanticLayerPct: 88,
        skillsPct: 86,
        experiencePct: 94,
        impactPct: 88,
        jdFitPct: 86,
        strengthsPct: 88,
        strengths: ["Executive presence and multi-year platform bets."],
        gaps: ["Hands-on SQL sessions rarer at current scope."],
        recommendationLabel: "STRONG HIRE",
        interviewProbes: ["Ask how they align eng capacity to catalog roadmap."],
      },
    },
    {
      id: "demo-pm-david",
      avatarUrl: "https://randomuser.me/api/portraits/men/55.jpg",
      name: "David Nguyen",
      roleTitle: "PM, Infra & Data",
      location: "Remote (US)",
      overall: 79,
      applicationRef: "Product Application Post · 0617",
      educationLine: "MS CS · UT Austin · 2016",
      rankingBars: [
        { label: "Semantic layer", value: 86 },
        { label: "Skills", value: 84 },
        { label: "Impact", value: 78 },
        { label: "JD fit", value: 80 },
      ],
      skillTags: ["K8s concepts", "SQL", "Observability", "PRDs", "Incident reviews"],
      bioSnippet:
        "PM between SRE and data eng; reliability SLOs and pipeline incident response.",
      fitAnalysis: {
        gaugeScore: 79,
        semanticLayerPct: 86,
        skillsPct: 84,
        experiencePct: 80,
        impactPct: 78,
        jdFitPct: 80,
        strengthsPct: 80,
        strengths: ["Strong bridge between infra and analytics consumers."],
        gaps: ["Product discovery for net-new analytics UX is lighter."],
        recommendationLabel: "HIRE",
        interviewProbes: ["Ask about postmortems that changed data architecture."],
      },
    },
  ],
  groupStrengths: [
    "Each candidate shows credible data fluency and roadmap judgment.",
    "Six profiles span senior IC PM, TPM, growth, group PM, and infra-adjacent product.",
    "Pool aligns with internal platform, metrics, and adoption objectives.",
  ],
  groupInterviewTips: [
    "For the interview: Ask Noah to prioritize a quarter with conflicting asks.",
    "For the interview: Ask Emma for milestones and risk buffers on a program plan.",
    "For the interview: Ask Sofia about self-serve education for non-analysts.",
    "Keep SQL depth consistent across the loop.",
    "Use Anika for platform strategy; Daniel for experimentation; David for reliability narratives.",
  ],
};

const BY_JOB: Record<string, DemoRankingBundle> = {
  "ml-eng-01": ML,
  "fullstack-02": FULLSTACK,
  "pm-data-03": PM_DATA,
};

export function getDemoRankingForJob(jobId: string): DemoRankingBundle {
  return BY_JOB[jobId] ?? ML;
}

export function candidatesSortedByOverall(
  bundle: DemoRankingBundle,
): DemoIdealCandidate[] {
  return [...bundle.candidates].sort((a, b) => b.overall - a.overall);
}

export function topCandidatesByOverall(
  bundle: DemoRankingBundle,
  count: number,
): DemoIdealCandidate[] {
  return candidatesSortedByOverall(bundle).slice(0, Math.max(0, count));
}
