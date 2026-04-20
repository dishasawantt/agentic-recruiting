"use client";

import type { Ref, RefObject } from "react";
import { METRIC } from "@/lib/metric-palette";

const ACCEPT =
  ".pdf,.doc,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,application/octet-stream";

export function ApplyDashboardLeftColumn({
  loading,
  file,
  resumeText,
  dragOver,
  fileInputRef,
  onFiles,
  setDragOver,
  clearFile,
  onBrowse,
  setResumeText,
  onAnalyze,
  canAnalyze,
}: {
  loading: boolean;
  file: File | null;
  resumeText: string;
  dragOver: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFiles: (files: FileList | null) => void;
  setDragOver: (v: boolean) => void;
  clearFile: () => void;
  onBrowse: () => void;
  setResumeText: (t: string) => void;
  onAnalyze: () => void;
  canAnalyze: boolean;
}) {
  return (
    <section
      className={`app-card p-6 shadow-[0_1px_3px_rgb(0_0_0/0.06),0_12px_32px_-16px_rgb(0_0_0/0.08)] md:p-7 ${
        loading ? "pointer-events-none opacity-65" : ""
      }`}
    >
      <div
        className={`relative min-h-[100px] rounded-xl border-2 border-dashed text-center transition-colors ${
          dragOver
            ? "border-sage-500 bg-sage-50/50"
            : "border-slate-200 bg-slate-50/40"
        }`}
      >
        <input
          ref={fileInputRef as Ref<HTMLInputElement>}
          name="resumeFile"
          type="file"
          accept={ACCEPT}
          className="absolute inset-0 z-20 block h-full min-h-[100px] w-full cursor-pointer opacity-[0.01]"
          style={{ fontSize: "80px" }}
          aria-label="Choose resume file"
          disabled={loading}
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            if (e.currentTarget === e.target) setDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onFiles(e.dataTransfer.files);
          }}
        />
        <div className="pointer-events-none relative z-10 flex min-h-[88px] flex-col items-center justify-center px-3 py-5">
          {file ? (
            <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-800">
              {file.name}
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-600">
              Drop resume or click to upload
            </span>
          )}
        </div>
        <div className="relative z-30 border-t border-slate-100 px-3 py-2 text-center">
          <button
            type="button"
            className="text-xs font-semibold underline"
            style={{ color: METRIC.primary }}
            onClick={onBrowse}
          >
            Browse files…
          </button>
          {file && (
            <button
              type="button"
              className="ml-3 text-xs font-medium text-slate-500 underline"
              onClick={clearFile}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <textarea
        className="app-input mt-3 h-24 w-full resize-y bg-white text-sm disabled:opacity-60"
        placeholder="Or paste resume text…"
        value={resumeText}
        disabled={loading}
        onChange={(e) => setResumeText(e.target.value)}
      />

      <button
        type="button"
        disabled={loading || !canAnalyze}
        onClick={onAnalyze}
        className="focus-ring mt-5 min-h-[48px] w-full rounded-xl bg-[#2D5A4C] py-3 text-center text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-[#244a3f] disabled:opacity-40"
      >
        {loading ? "Analyzing Resume…" : "Analyze Candidate Fit"}
      </button>

      {loading && (
        <p
          className="mt-3 flex items-center justify-center gap-2 text-xs font-medium"
          style={{ color: METRIC.primary }}
        >
          <span
            className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200"
            style={{ borderTopColor: METRIC.primary }}
          />
          Analyzing Resume…
        </p>
      )}
    </section>
  );
}
