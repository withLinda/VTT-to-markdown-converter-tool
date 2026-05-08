"use client";

import React from 'react';
import type { LoadedFile } from '@/types';
import { convertVTTToMarkdown } from '@/lib/convertVTTToMarkdown';

interface Props {
  file?: LoadedFile;
  gapThresholdSec: number;
  onConverted: (id: string, markdown: string) => void;
}

export default function PreviewPane({ file, gapThresholdSec, onConverted }: Props) {
  if (!file) return <div className="p-6 text-everforest-grey1">Select a file to preview.</div>;

  async function handleConvert() {
    try {
      const f = file;
      if (!f) throw new Error('No file selected');
      if (!f.text) throw new Error('No text loaded');
      const md = convertVTTToMarkdown(f.text, gapThresholdSec);
      onConverted(f.id, md);
    } catch (e: any) {
      if (file) onConverted(file.id, '');
      // Parent should set error status; we rely on parent reducer
    }
  }

  function downloadOne() {
    if (!file?.markdown) return;
    const outName = file.name.replace(/\.vtt$/i, '.md');
    const blob = new Blob([file.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = outName; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-everforest-bg4/60 p-3 bg-gradient-to-r from-everforest-bg1/95 to-everforest-bg-blue/55">
        <div className="text-sm font-medium text-everforest-fg">
          <span className="font-semibold text-everforest-yellow">{file.relativePath}</span>
          <span className="text-everforest-grey1 mx-2">·</span>
          <span className="text-everforest-orange">{(file.size/1024).toFixed(1)} KB</span>
          <span className="text-everforest-grey1 mx-2">·</span>
          <span className="text-everforest-green">{file.status}</span>
        </div>
        {file.status !== 'converted' ? (
          <button className="btn btn--success" onClick={handleConvert} aria-label="Convert">Convert</button>
        ) : (
          <button className="btn btn--info" onClick={downloadOne} aria-label="Download">Download Markdown</button>
        )}
      </div>
      <div className="flex-1 p-3">
        {file.status === 'converted' && file.markdown ? (
          <textarea
            className="w-full h-full resize-none border border-everforest-green/45 rounded-xl p-4 bg-gradient-to-br from-everforest-bg-dim to-everforest-bg0 custom-scrollbar shadow-inner font-mono text-sm leading-relaxed text-everforest-fg"
            readOnly
            value={file.markdown}
          />
        ) : (
          <textarea
            className="w-full h-full resize-none border border-everforest-bg4/70 rounded-xl p-4 bg-gradient-to-br from-everforest-bg-dim to-everforest-bg0 custom-scrollbar shadow-inner font-mono text-sm leading-relaxed text-everforest-grey0"
            readOnly
            value={file.text || ''}
          />
        )}
      </div>
    </div>
  );
}
