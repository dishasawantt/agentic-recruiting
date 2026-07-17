# Agentic Recruiting Platform

> AI-powered recruiting demo: resume screening, interview simulation, voice Q&A, and scorecard review — deployed on Cloudflare Workers.

## Problem

Recruiting teams need a fast way to screen resumes, run structured interviews, and produce consistent candidate scorecards — without manual review bottlenecks.

## Key Features

- **AI resume screening** — PDF/DOCX extraction, Groq LLM scoring, optional OpenAI embedding similarity
- **Interview question generation** tailored to job + candidate profile
- **Turn-by-turn interview simulation** with dimension scoring
- **Voice Q&A** via Web Speech API
- **Automated interview review** scorecards with visual gauges
- **Demo ranking dashboard** for recruiter-side comparison

## Architecture

```
Next.js App Router → API Routes (Cloudflare Workers) → Groq / OpenAI APIs
                   ↘ sessionStorage (candidate journey state)
```

| Route | Purpose |
|---|---|
| `/api/screen` | Resume screening against job description |
| `/api/interview-questions` | Generate tailored interview questions |
| `/api/interview-sim/next` | Turn-by-turn interview simulation |
| `/api/interview-review` | Scorecard from voice Q&A export |
| `/api/health` | Health check |

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, TypeScript |
| AI | Groq (LLaMA 3.3 70B, LLaMA 3.1 8B), OpenAI embeddings |
| Parsing | Mammoth (DOCX), pdf-parse (PDF), Zod validation |
| Deployment | Cloudflare Workers via OpenNext |

## Setup

### Prerequisites

- Node.js 20+
- Groq API key (required)
- OpenAI API key (optional, for embedding similarity)

### Installation

```bash
git clone https://github.com/dishasawantt/agentic-recruiting.git
cd agentic-recruiting
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key   # optional
```

### Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### Deploy to Cloudflare

```bash
npm run deploy
```

Set `GROQ_API_KEY` and `OPENAI_API_KEY` in Cloudflare Workers environment variables.

## Candidate Journey

1. Browse job listings → Apply
2. Upload/paste resume → AI screening with match score
3. Generated interview questions
4. Text interview simulation
5. Voice Q&A (browser speech)
6. Interview review scorecard

## Project Structure

```
src/
├── app/              # Pages and API routes
├── components/       # React UI (screening flow, score viz)
└── lib/              # Screening, interview, AI client logic
```

## Security and Privacy

- API keys via environment variables only.
- Resume text processed server-side; no persistent database.
- Demo uses mock job listings and sessionStorage for state.

## Author

**Disha Sawant** — [GitHub](https://github.com/dishasawantt) · [Portfolio](https://dishasawantt.github.io/resume)
