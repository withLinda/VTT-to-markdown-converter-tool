import type { LoadedFile } from '@/types';

export function isVTTFileName(name: string): boolean {
  return /\.vtt$/i.test(name);
}

export function isVTTFile(file: File): boolean {
  return isVTTFileName(file.name) || file.type === 'text/vtt';
}

export async function readText(file: File): Promise<string> {
  return await file.text();
}

export async function loadFilesFromFileList(list: FileList): Promise<LoadedFile[]> {
  const arr = Array.from(list).filter(isVTTFile);
  const out: LoadedFile[] = [];
  for (const f of arr) {
    const text = await readText(f);
    const relativePath = (f as any).webkitRelativePath || f.name;
    out.push({
      id: relativePath,
      name: f.name,
      relativePath,
      size: f.size,
      text,
      status: 'parsed',
    });
  }
  return out;
}
