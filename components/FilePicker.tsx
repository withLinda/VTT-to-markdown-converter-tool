"use client";

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import type { LoadedFile } from '@/types';
import { loadFilesFromFileList } from '@/lib/files';

export type FilePickerHandle = {
  pickFiles: () => void;
  pickFolder: () => void;
};

interface Props {
  onFilesLoaded: (files: LoadedFile[]) => void;
  onError?: (message: string) => void;
}

const FilePicker = forwardRef<FilePickerHandle, Props>(function FilePicker({ onFilesLoaded, onError }, ref) {
  const filesInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    pickFiles: () => filesInputRef.current?.click(),
    pickFolder: () => folderInputRef.current?.click(),
  }), []);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!e.target.files) return;
      const loaded = await loadFilesFromFileList(e.target.files);
      if (!loaded.length) onError?.('No .vtt files found.');
      onFilesLoaded(loaded);
      e.target.value = '';
    } catch (err: any) {
      onError?.(err?.message || 'Failed to read files');
    }
  }

  return (
    <div className="sr-only" aria-hidden>
      <input ref={filesInputRef} type="file" multiple onChange={onChange} accept=".vtt,text/vtt" />
      <input ref={folderInputRef} type="file" multiple onChange={onChange} //@ts-expect-error webkitdirectory
        webkitdirectory="true"/>
    </div>
  );
});

export default FilePicker;
