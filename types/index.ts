export type FileId = string;

export type FileStatus = 'idle' | 'parsed' | 'converted' | 'error';

export interface LoadedFile {
  id: FileId;
  name: string;
  relativePath: string;
  size: number;
  text?: string;
  markdown?: string;
  status: FileStatus;
  error?: string;
}

export interface AppState {
  files: Record<FileId, LoadedFile>;
  selectedId?: FileId;
  gapThresholdSec: number; // default 0.3
}
