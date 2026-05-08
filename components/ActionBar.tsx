"use client";

import React from 'react';
import ProgressBar from './ProgressBar';

interface Props {
  onPickFiles: () => void;
  onPickFolder: () => void;
  onConvertAll: () => void;
  onDownloadAll: () => void;
  convertedCount: number;
  totalCount: number;
  downloadAllEnabled: boolean;
  downloadEnableRule: 'all' | 'any';
  onChangeDownloadEnableRule: (rule: 'all' | 'any') => void;
}

export default function ActionBar(props: Props) {
  const {
    onPickFiles,
    onPickFolder,
    onConvertAll,
    onDownloadAll,
    convertedCount,
    totalCount,
    downloadAllEnabled,
    downloadEnableRule,
    onChangeDownloadEnableRule,
  } = props;

  const pct = totalCount ? Math.round((convertedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-everforest-bg4/60 bg-everforest-bg1">
      <div className="flex items-center gap-2">
        <button className="btn btn--frost" onClick={onPickFiles} aria-label="Pick Files">Pick Files</button>
        <button className="btn btn--frost" onClick={onPickFolder} aria-label="Pick Folder">Pick Folder</button>
        <button className="btn btn--success" onClick={onConvertAll} aria-label="Convert All" disabled={!totalCount}>Convert All</button>
        <button className="btn btn--primary" onClick={onDownloadAll} aria-label="Download All" disabled={!downloadAllEnabled}>Download All</button>
        <div className="flex items-center gap-2 ml-3 text-xs text-everforest-grey1">
          <label className="flex items-center gap-1" htmlFor="rule">
            Enable when:
          </label>
          <select id="rule" className="border border-everforest-bg4 rounded p-1 bg-everforest-bg-dim text-everforest-fg" value={downloadEnableRule} onChange={(e) => onChangeDownloadEnableRule(e.target.value as 'all' | 'any')} aria-label="Download All enable rule">
            <option value="all">all converted</option>
            <option value="any">at least one</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-everforest-fg">{convertedCount}/{totalCount} converted</span>
        <ProgressBar value={pct} label="Converting…" />
      </div>
    </div>
  );
}
