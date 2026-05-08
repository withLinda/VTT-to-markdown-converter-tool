"use client";

import React, { useMemo, useReducer, useRef, useState } from 'react';
import type { AppState, LoadedFile } from '@/types';
import FilePicker, { type FilePickerHandle } from '@/components/FilePicker';
import FileTree from '@/components/FileTree';
import PreviewPane from '@/components/PreviewPane';
import ProgressBar from '@/components/ProgressBar';
import { convertVTTToMarkdown } from '@/lib/convertVTTToMarkdown';
import { GAP_DEFAULT_SEC, GAP_MAX_SEC, GAP_MIN_SEC, GAP_STEP_SEC } from '@/lib/conversionSettings';
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
    case 'set_gap': {
      let files = state.files;

      for (const [id, f] of Object.entries(state.files)) {
        if (f.status !== 'converted' || !f.text) continue;

        const markdown = convertVTTToMarkdown(f.text, action.gap);
        const nf: LoadedFile = {
          ...f,
          markdown,
          status: markdown ? 'converted' : 'error',
          error: markdown ? undefined : 'Conversion failed',
        };

        if (files === state.files) files = { ...state.files };
        files[id] = nf;
      }

      return { ...state, files, gapThresholdSec: action.gap };
    }
    default:
      return state;
  }
}

export default function Page() {
  const [state, dispatch] = useReducer(reducer, { files: {}, selectedId: undefined, gapThresholdSec: GAP_DEFAULT_SEC });
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
        const md = convertVTTToMarkdown(f.text, state.gapThresholdSec);
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
    <div className="app-shell h-screen min-w-0 bg-gradient-to-br from-everforest-bg-dim via-everforest-bg0 to-everforest-bg-green flex flex-col sm:flex-row overflow-hidden" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      {/* Sidebar (left) */}
      <aside className="app-sidebar w-full min-w-0 sm:w-[280px] sm:min-w-[280px] bg-gradient-to-br from-everforest-bg0 via-everforest-bg1 to-everforest-bg0 border-b sm:border-b-0 sm:border-r border-everforest-bg4/60 flex flex-col max-h-[46vh] sm:max-h-none sm:h-screen overflow-hidden shadow-xl">
        {/* File actions */}
        <div className="p-4 border-b border-everforest-bg4/60 space-y-3 bg-gradient-to-r from-everforest-bg-yellow/35 to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-everforest-fg">
              Files <span className="text-everforest-orange">({totalCount})</span>
            </h2>
          </div>

          <div className="sidebar-control-grid grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0 w-[calc(100vw-2rem)] max-w-full sm:w-full">
            <button className="btn btn--frost w-full min-w-0"
                    onClick={() => pickerRef.current?.pickFiles()}>
              Add Files
            </button>
            <button className="btn btn--frost w-full min-w-0"
                    onClick={() => pickerRef.current?.pickFolder()}>
              Add Folder
            </button>
          </div>

          <div className="sidebar-control-grid grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0 w-[calc(100vw-2rem)] max-w-full sm:w-full">
            <button className="btn btn--primary w-full min-w-0"
                    onClick={onConvertAll}
                    disabled={!totalCount}>
              Convert All
            </button>
            <button className="btn btn--primary w-full min-w-0"
                    onClick={onDownloadAll}
                    disabled={!downloadAllEnabled}>
              Download All
            </button>
          </div>

          {/* Download enable rule */}
          <div className="sidebar-control-panel flex flex-col sm:flex-row sm:items-center gap-2 text-xs bg-everforest-bg1/70 p-2 rounded-lg border border-everforest-bg4/35 w-[calc(100vw-2rem)] max-w-full sm:w-full">
            <label htmlFor="rule" className="text-everforest-grey1 font-medium">Enable when:</label>
            <select
              id="rule"
              className="w-full sm:w-auto border border-everforest-bg4 rounded-lg px-2 py-1 bg-everforest-bg-dim text-everforest-fg font-medium focus:border-everforest-aqua focus:outline-none transition-colors"
              value={downloadEnableRule}
              onChange={(e) => setDownloadEnableRule(e.target.value as 'all' | 'any')}
            >
              <option value="all">all converted</option>
              <option value="any">at least one</option>
            </select>
          </div>

          {/* Progress */}
          <div className="sidebar-control-panel relative overflow-hidden bg-gradient-to-r from-everforest-bg-green/80 to-everforest-bg-blue/55 p-3 rounded-xl border border-everforest-bg4/35 w-[calc(100vw-2rem)] max-w-full sm:w-full">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-everforest-fg">
                <span className="text-everforest-green">{convertedCount}</span>
                <span className="text-everforest-grey1 mx-1">/</span>
                <span className="text-everforest-yellow">{totalCount}</span>
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
      <section className="flex-1 min-h-0 min-w-0 p-4 sm:p-6 overflow-hidden flex flex-col">
        {/* Paragraph gap slider with dynamic fill */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-everforest-bg4/60 pb-4 mb-4 bg-gradient-to-r from-everforest-bg1/90 to-everforest-bg-blue/55 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 rounded-b-xl">
          <div className="flex min-w-0 items-baseline gap-2">
            <label htmlFor="gap" className="text-sm font-medium text-everforest-fg">New paragraph after pause:</label>
            <span className="text-sm font-semibold text-everforest-yellow">{state.gapThresholdSec.toFixed(1)}s</span>
          </div>
          <div className="basis-full w-full max-w-md shrink-0">
            <div className="range-wrapper" style={{ '--range-progress': `${(state.gapThresholdSec / GAP_MAX_SEC) * 100}%` } as React.CSSProperties}>
              <input id="gap" type="range" min={GAP_MIN_SEC} max={GAP_MAX_SEC} step={GAP_STEP_SEC}
                     value={state.gapThresholdSec}
                     onChange={(e) => dispatch({ type: 'set_gap', gap: Number(e.target.value) })}/>
            </div>
            <div className="mt-1 flex justify-between text-[0.65rem] font-medium text-everforest-grey1">
              <span>More breaks</span>
              <span>Fewer breaks</span>
            </div>
          </div>
          {isConverting && <span className="text-sm text-everforest-orange font-medium">Converting… {convertedCount}/{totalCount}</span>}
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
