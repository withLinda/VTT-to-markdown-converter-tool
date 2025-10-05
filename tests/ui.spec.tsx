import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ActionBar from '@/components/ActionBar';

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
