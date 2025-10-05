export interface Cue { start: number; end: number; text: string }

const TIME_RE = /^(?<start>(?:\d{2}:)?\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})\s*-->\s*(?<end>(?:\d{2}:)?\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})/;

function parseTimestamp(ts: string): number {
  const parts = ts.split(':');
  if (parts.length === 3) {
    const [h, m, sMs] = parts; const [s, ms] = sMs.split('.');
    return Number(h)*3600 + Number(m)*60 + Number(s) + Number(ms)/1000;
  }
  if (parts.length === 2) {
    const [m, sMs] = parts; const [s, ms] = sMs.split('.');
    return Number(m)*60 + Number(s) + Number(ms)/1000;
  }
  const [s, ms] = ts.split('.');
  return Number(s) + Number(ms)/1000;
}

function stripTags(s: string): string {
  // remove WebVTT/HTML tags: <i>, <b>, <u>, <c>, <v>, <ruby>, <rt>, <lang>, etc.
  return s.replace(/<[^>]+>/g, '');
}

function cleanLine(s: string): string {
  // Remove speaker arrows and leading dashes; collapse whitespace.
  return stripTags(s)
    .replace(/^[-–—>»]+\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function parseVTTText(vtt: string): Cue[] {
  const lines = vtt.replace(/^\uFEFF/, '').split(/\r?\n/);
  const cues: Cue[] = [];
  for (let i=0; i<lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === 'WEBVTT' || line.startsWith('NOTE')) continue;
    const m = line.match(TIME_RE);
    if (!m) continue;
    const start = parseTimestamp(m.groups!.start);
    const end = parseTimestamp(m.groups!.end);
    i++;
    const textLines: string[] = [];
    for (; i<lines.length; i++) {
      const t = lines[i];
      if (!t.trim()) break;
      if (TIME_RE.test(t.trim())) { i--; break; }
      textLines.push(cleanLine(t));
    }
    const text = textLines.join(' ').replace(/\s{2,}/g, ' ').trim();
    if (text) cues.push({ start, end, text });
  }
  return cues;
}
