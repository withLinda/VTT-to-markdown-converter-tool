import JSZip from 'jszip';
import type { LoadedFile } from '@/types';

export async function zipConverted(files: LoadedFile[]): Promise<Blob> {
  const zip = new JSZip();
  for (const f of files) {
    if (!f.markdown) continue;
    const outPath = f.relativePath.replace(/\.vtt$/i, '.md');
    zip.file(outPath, f.markdown);
  }
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
