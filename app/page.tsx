"use client";

import React, { useMemo, useReducer, useRef, useState } from 'react';
import type { AppState, LoadedFile } from '@/types';
import FilePicker, { type FilePickerHandle } from '@/components/FilePicker';
import FileTree from '@/components/FileTree';
import PreviewPane from '@/components/PreviewPane';
import ProgressBar from '@/components/ProgressBar';
import { parseVTTText } from '@/lib/parseVTT';
import { cuesToParagraphs } from '@/lib/cuesToParagraphs';
import { zipConverted } from '@/lib/zip';

type Action =
  | { type: 'add_files'; files: LoadedFile[] }
  | { type: 'select'; id?: string }
  | { type: 'converted'; id: string; markdown: string }
  | { type: 'set_gap'; gap: number };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'add_files': {
      const files = { ...state.files };
      for (const f of action.files) files[f.id] = f;
      const selectedId = state.selectedId || action.files[0]?.id;
      return { ...state, files, selectedId };
    }
    case 'select':
      return { ...state, selectedId: action.id };
    case 'converted': {
      const f = state.files[action.id];
      if (!f) return state;
      const nf: LoadedFile = { ...f, markdown: action.markdown, status: action.markdown ? 'converted' : 'error', error: action.markdown ? undefined : 'Conversion failed' };
      return { ...state, files: { ...state.files, [action.id]: nf } };
    }
    case 'set_gap':
      return { ...state, gapThresholdSec: action.gap };
    default:
      return state;
  }
}

export default function Page() {
  const [state, dispatch] = useReducer(reducer, { files: {}, selectedId: undefined, gapThresholdSec: 3.0 });
  const pickerRef = useRef<FilePickerHandle>(null);
  const [downloadEnableRule, setDownloadEnableRule] = useState<'all' | 'any'>('all');
  const [isConverting, setIsConverting] = useState(false);

  const filesArr = useMemo(() => Object.values(state.files), [state.files]);
  const totalCount = filesArr.length;
  const convertedCount = filesArr.filter((f) => f.status === 'converted').length;
  const downloadAllEnabled = downloadEnableRule === 'all' ? (totalCount > 0 && convertedCount === totalCount) : convertedCount > 0;

  async function onConvertAll() {
    setIsConverting(true);
    try {
      for (const f of filesArr) {
        if (!f.text) continue;
        const cues = parseVTTText(f.text);
        const paras = cuesToParagraphs(cues, state.gapThresholdSec);
        const md = paras.join('\n\n');
        dispatch({ type: 'converted', id: f.id, markdown: md });
        // allow UI to update
        await new Promise((r) => setTimeout(r, 0));
      }
    } finally {
      setIsConverting(false);
    }
  }

  async function onDownloadAll() {
    const blob = await zipConverted(filesArr.filter((f) => f.status === 'converted'));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'converted.zip'; a.click();
    URL.revokeObjectURL(url);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const list = e.dataTransfer.files;
    if (!list || list.length === 0) return;
    // Use FilePicker loader via hidden input path; reproduce simple logic here
    (async () => {
      const { loadFilesFromFileList } = await import('@/lib/files');
      const loaded = await loadFilesFromFileList(list);
      if (loaded.length) dispatch({ type: 'add_files', files: loaded });
    })();
  }

  return (
    <div className="h-screen bg-gradient-to-br from-everforest-bg0 via-everforest-bg1 to-everforest-bg-green/10 flex overflow-hidden" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      {/* Sidebar (left) */}
      <aside className="w-full sm:w-[280px] sm:min-w-[280px] bg-gradient-to-br from-everforest-bg-dim via-everforest-bg0 to-everforest-bg1 border-r-2 border-everforest-bg4/50 flex flex-col h-screen overflow-hidden shadow-xl">
        {/* File actions */}
        <div className="p-4 border-b-2 border-everforest-bg4/50 space-y-3 bg-gradient-to-r from-everforest-bg-purple/10 to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold bg-gradient-to-r from-everforest-blue to-everforest-purple bg-clip-text text-transparent">
              Files <span className="text-everforest-aqua">({totalCount})</span>
            </h2>
          </div>

          <div className="flex gap-2">
            <button className="btn btn--frost flex-1"
                    onClick={() => pickerRef.current?.pickFiles()}>
              Add Files
            </button>
            <button className="btn btn--frost flex-1"
                    onClick={() => pickerRef.current?.pickFolder()}>
              Add Folder
            </button>
          </div>

          <div className="flex gap-2">
            <button className="btn btn--primary flex-1"
                    onClick={onConvertAll}
                    disabled={!totalCount}>
              Convert All
            </button>
            <button className="btn btn--primary flex-1"
                    onClick={onDownloadAll}
                    disabled={!downloadAllEnabled}>
              Download All
            </button>
          </div>

          {/* Download enable rule */}
          <div className="flex items-center gap-2 text-xs bg-everforest-bg1/50 p-2 rounded-lg">
            <label htmlFor="rule" className="text-everforest-grey1 font-medium">Enable when:</label>
            <select
              id="rule"
              className="border-2 border-everforest-bg4 rounded-lg px-2 py-1 bg-everforest-bg0 text-everforest-fg font-medium focus:border-everforest-blue focus:outline-none transition-colors"
              value={downloadEnableRule}
              onChange={(e) => setDownloadEnableRule(e.target.value as 'all' | 'any')}
            >
              <option value="all">all converted</option>
              <option value="any">at least one</option>
            </select>
          </div>

          {/* Progress */}
          <div className="relative overflow-hidden bg-gradient-to-r from-everforest-bg-green/10 to-everforest-bg-aqua/10 p-3 rounded-xl border border-everforest-bg4/30">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-everforest-fg">
                <span className="text-everforest-aqua">{convertedCount}</span>
                <span className="text-everforest-grey1 mx-1">/</span>
                <span className="text-everforest-blue">{totalCount}</span>
                <span className="ml-2 text-everforest-grey1">converted</span>
              </span>
            </div>
            <ProgressBar value={totalCount ? Math.round((convertedCount/totalCount)*100) : 0} />
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <FileTree files={filesArr}
                    selectedId={state.selectedId}
                    onSelect={(id) => dispatch({ type: 'select', id })}/>
        </div>
      </aside>

      {/* Main content (right) */}
      <section className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col backdrop-blur-sm">
        {/* Paragraph gap slider with dynamic fill */}
        <div className="flex flex-wrap items-center gap-3 border-b-2 border-everforest-bg4/50 pb-4 mb-4 bg-gradient-to-r from-everforest-bg-blue/5 to-everforest-bg-purple/5 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 rounded-b-xl">
          <label htmlFor="gap" className="text-sm font-medium text-everforest-fg">Paragraph gap:</label>
          <div className="range-wrapper flex-1 max-w-xs" style={{ '--range-progress': `${(state.gapThresholdSec / 10) * 100}%` } as React.CSSProperties}>
            <input id="gap" type="range" min={0} max={10} step={0.5}
                   value={state.gapThresholdSec}
                   onChange={(e) => dispatch({ type: 'set_gap', gap: Number(e.target.value) })}/>
          </div>
          <span className="text-sm font-semibold text-everforest-blue min-w-[3rem]">{state.gapThresholdSec.toFixed(1)}s</span>
          {isConverting && <span className="text-sm text-everforest-purple font-medium">Converting… {convertedCount}/{totalCount}</span>}
        </div>

        {/* Preview stays as-is, just inherits colors */}
        <div className="flex-1 min-h-0">
          <PreviewPane
            file={state.selectedId ? state.files[state.selectedId] : undefined}
            gapThresholdSec={state.gapThresholdSec}
            onConverted={(id, markdown) => dispatch({ type: 'converted', id, markdown })}
          />
        </div>
      </section>

      {/* Keep the hidden picker */}
      <FilePicker ref={pickerRef} onFilesLoaded={(files) => dispatch({ type: 'add_files', files })} />
    </div>
  );
}
