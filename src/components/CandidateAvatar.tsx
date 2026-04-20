"use client";

import Image from "next/image";

export function CandidateAvatar({
  name,
  src,
  size,
  className = "",
}: {
  name: string;
  src: string;
  size: number;
  className?: string;
}) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full bg-slate-200 ring-2 ring-white shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={`${name} portrait`}
        width={size}
        height={size}
        className="h-full w-full object-cover object-top"
        sizes={`${size}px`}
      />
    </span>
  );
}
