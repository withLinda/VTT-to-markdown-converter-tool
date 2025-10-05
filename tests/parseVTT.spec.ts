import { describe, it, expect } from 'vitest';
import { parseVTTText } from '@/lib/parseVTT';

const sample = `WEBVTT\n\n00:00:01.000 --> 00:00:03.000\n- Hello <i>world</i>!\n\n00:00:03.500 --> 00:00:05.000\n> How are you?\n`;

describe('parseVTTText', () => {
  it('parses basic cues and strips tags/arrows', () => {
    const cues = parseVTTText(sample);
    expect(cues.length).toBe(2);
    expect(cues[0].start).toBeCloseTo(1);
    expect(cues[0].end).toBeCloseTo(3);
    expect(cues[0].text).toBe('Hello world!');
    expect(cues[1].text).toBe('How are you?');
  });
});
