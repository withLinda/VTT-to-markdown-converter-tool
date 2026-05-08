"use client";

import React from 'react';

interface Props {
  value: number; // 0..100
  label?: string;
}

export default function ProgressBar({ value, label }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full" aria-label={label || "Progress"} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      {label && <div className="flex items-center gap-2 mb-2">
        <span className="text-sm" aria-live="polite">{label}</span>
        <span className="text-xs text-everforest-grey1">{pct}%</span>
      </div>}
      <div className="progress">
        <div className="progress__bar" style={{ '--value': `${pct}%` } as React.CSSProperties} />
      </div>
    </div>
  );
}
