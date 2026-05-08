import { describe, it, expect } from 'vitest';
import { cuesToParagraphs } from '@/lib/cuesToParagraphs';

describe('cuesToParagraphs', () => {
  it('groups cues by gap threshold', () => {
    const cues = [
      { start: 0, end: 1, text: 'Hello' },
      { start: 1.1, end: 2, text: 'world' },
      { start: 6.2, end: 7, text: 'New para' },
    ];
    const paras = cuesToParagraphs(cues, 3.0);
    expect(paras).toEqual(['Hello world', 'New para']);
  });

  it('splits back-to-back cues when the threshold is zero', () => {
    const cues = [
      { start: 0, end: 1, text: 'First cue' },
      { start: 1, end: 2, text: 'Second cue' },
      { start: 2, end: 3, text: 'Third cue' },
    ];

    const paras = cuesToParagraphs(cues, 0);

    expect(paras).toEqual(['First cue', 'Second cue', 'Third cue']);
  });
});
