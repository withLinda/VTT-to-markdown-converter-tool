import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import ActionBar from '@/components/ActionBar';
import Page from '@/app/page';

afterEach(() => {
  cleanup();
});

const sampleVTT = `WEBVTT

00:00.000 --> 00:01.000
First

00:01.200 --> 00:02.000
continues

00:02.400 --> 00:03.000
Second paragraph
`;

async function loadSampleFile(container: HTMLElement) {
  const file = new File([sampleVTT], 'sample.vtt', { type: 'text/vtt' });
  Object.defineProperty(file, 'text', { value: () => Promise.resolve(sampleVTT) });

  const input = container.querySelector('input[type="file"][accept]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
  await screen.findByRole('button', { name: 'File sample.vtt' });
}

function previewValue(container: HTMLElement) {
  return (container.querySelector('textarea') as HTMLTextAreaElement).value;
}

function setParagraphGap(value: string) {
  fireEvent.input(screen.getByRole('slider', { name: /Paragraph gap/i }), { target: { value } });
}

describe('ActionBar', () => {
  it('disables Download All when not enabled', () => {
    render(
      <ActionBar
        onPickFiles={() => {}}
        onPickFolder={() => {}}
        onConvertAll={() => {}}
        onDownloadAll={() => {}}
        convertedCount={0}
        totalCount={2}
        downloadAllEnabled={false}
        downloadEnableRule="all"
        onChangeDownloadEnableRule={() => {}}
      />
    );
    const btn = screen.getByRole('button', { name: /Download All/i });
    expect(btn).toBeDisabled();
  });
});

describe('Page paragraph gap control', () => {
  it('uses a fine default gap for dense captions', () => {
    render(<Page />);

    expect(screen.getByRole('slider', { name: /Paragraph gap/i })).toHaveValue('0.3');
    expect(screen.getByText('0.3s')).toBeInTheDocument();
  });

  it('uses the selected gap when converting after slider changes', async () => {
    const { container } = render(<Page />);

    await loadSampleFile(container);
    setParagraphGap('0.5');
    fireEvent.click(screen.getByRole('button', { name: 'Convert' }));

    await waitFor(() => expect(previewValue(container)).toBe('First continues Second paragraph'));
  });

  it('updates already converted markdown when the gap slider changes', async () => {
    const { container } = render(<Page />);

    await loadSampleFile(container);
    fireEvent.click(screen.getByRole('button', { name: 'Convert' }));
    await waitFor(() => expect(previewValue(container)).toBe('First continues\n\nSecond paragraph'));

    setParagraphGap('0.5');

    await waitFor(() => expect(previewValue(container)).toBe('First continues Second paragraph'));
  });
});
