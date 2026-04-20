import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice Q&A",
  description:
    "AI-generated interview questions from your screening, voice prompts, answer capture",
};

export default function VoiceInterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
