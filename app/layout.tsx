import '../styles/globals.css';
import React from 'react';

export const metadata = {
  title: 'VTT → Markdown Converter',
  description: 'Convert WebVTT subtitle files to Markdown paragraphs in-browser.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gradient-to-br from-everforest-bg0 via-everforest-bg1 to-everforest-bg-green/10 text-everforest-fg antialiased">{children}</body>
    </html>
  );
}
