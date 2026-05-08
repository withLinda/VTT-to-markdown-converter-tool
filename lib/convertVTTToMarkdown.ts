import { cuesToParagraphs } from './cuesToParagraphs';
import { GAP_DEFAULT_SEC } from './conversionSettings';
import { parseVTTText } from './parseVTT';

export function convertVTTToMarkdown(vttText: string, gapThresholdSec = GAP_DEFAULT_SEC): string {
  const cues = parseVTTText(vttText);
  const paragraphs = cuesToParagraphs(cues, gapThresholdSec);

  return paragraphs.join('\n\n');
}
