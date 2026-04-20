"use client";

import { useMemo, type ReactNode } from "react";
import type { ScreenSourceMeta } from "@/lib/types";

function renderHighlighted(text: string, needle: string | null) {
  if (!needle?.trim() || !text) {
    return text;
  }
  const n = needle.trim();
  const lowerText = text.toLowerCase();
  const lowerNeedle = n.toLowerCase();
  const parts: ReactNode[] = [];
  let start = 0;
  let pos = lowerText.indexOf(lowerNeedle, start);
  let key = 0;
  let guard = 0;
  while (pos !== -1 && guard++ < 500) {
    parts.push(text.slice(start, pos));
    parts.push(
      <mark
        key={key++}
        className="rounded-sm bg-amber-200/95 px-0.5 font-medium text-slate-900"
      >
        {text.slice(pos, pos + n.length)}
      </mark>
    );
    start = pos + n.length;
    pos = lowerText.indexOf(lowerNeedle, start);
  }
  parts.push(text.slice(start));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export function ResumeSourcePanel({
  file,
  resumeText,
  sourceMeta,
  highlightSkill,
  onClearHighlight,
}: {
  file: File | null;
  resumeText: string;
  sourceMeta?: ScreenSourceMeta | null;
  highlightSkill: string | null;
  onClearHighlight: () => void;
}) {
  const previewBody = sourceMeta?.preview ?? resumeText;
  const charCount = sourceMeta?.charCount ?? resumeText.length;
  const fromFile = sourceMeta?.fromFile ?? !!file;

  const statusLabel = useMemo(() => {
    if (sourceMeta) {
      return "Analyzed source";
    }
    if (file) {
      return "File queued — text extracts on analyze";
    }
    if (resumeText.trim().length > 0) {
      return "Draft text";
    }
    return "No source yet";
  }, [sourceMeta, file, resumeText]);

  const truncated =
    previewBody.length > 4500
      ? `${previewBody.slice(0, 4500)}…`
      : previewBody;

  return (
    <div className="flex min-h-[200px] flex-1 flex-col rounded-xl border border-slate-200/80 bg-[#fafbfb]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Source
        </span>
        <span className="text-[10px] text-slate-400">{statusLabel}</span>
      </div>
      <div className="flex flex-wrap gap-3 border-b border-slate-100 px-4 py-2 text-[11px] text-slate-600">
        <span>
          <span className="text-slate-400">Chars</span>{" "}
          <span className="font-semibold tabular-nums text-slate-800">
            {charCount.toLocaleString()}
          </span>
        </span>
        <span>
          <span className="text-slate-400">Origin</span>{" "}
          <span className="font-medium text-slate-800">
            {fromFile ? "Upload" : "Paste"}
          </span>
        </span>
        {file && (
          <span className="truncate text-slate-500" title={file.name}>
            {file.name}
          </span>
        )}
      </div>
      <div className="relative min-h-[140px] flex-1 overflow-y-auto p-4">
        {highlightSkill && (
          <button
            type="button"
            onClick={onClearHighlight}
            className="focus-ring mb-2 text-[10px] font-semibold uppercase tracking-wider text-sage-700 hover:text-sage-900"
          >
            Clear highlight (Esc)
          </button>
        )}
        {truncated.trim().length > 0 ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-700">
            {renderHighlighted(truncated, highlightSkill)}
          </pre>
        ) : (
          <p className="text-center text-xs leading-relaxed text-slate-400">
            Upload a file or paste resume text. A scrollable preview of what
            the model reads appears here after you run fit analysis.
          </p>
        )}
      </div>
    </div>
  );
}
