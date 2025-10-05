import type { Cue } from './parseVTT';

export function cuesToParagraphs(cues: Cue[], gapThresholdSec = 3.0): string[] {
  const paras: string[] = [];
  let buf: string[] = [];
  let lastEnd = -Infinity;

  for (const cue of cues) {
    const gap = cue.start - lastEnd;
    if (buf.length && gap > gapThresholdSec) {
      paras.push(buf.join(' ').replace(/\s{2,}/g, ' ').trim());
      buf = [];
    }
    buf.push(cue.text);
    lastEnd = cue.end;
  }
  if (buf.length) paras.push(buf.join(' ').replace(/\s{2,}/g, ' ').trim());
  return paras.filter(Boolean);
}
