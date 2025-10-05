"use client";

import React, { useMemo, useState, useCallback } from 'react';
import type { LoadedFile } from '@/types';
import { buildFileTree, sortTree, type TreeNode } from '@/lib/buildFileTree';

interface Props {
  files: LoadedFile[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

type Item =
  | { type: 'folder'; key: string; depth: number; node: TreeNode }
  | { type: 'file'; key: string; depth: number; file: LoadedFile };

export default function FileTree({ files, selectedId, onSelect }: Props) {
  const root = useMemo(() => {
    const t = buildFileTree(files);
    sortTree(t);
    return t;
  }, [files]);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const items = useMemo(() => {
    const out: Item[] = [];
    function walk(node: TreeNode, depth: number) {
      if (node.path) out.push({ type: 'folder', key: `dir:${node.path}`, depth, node });
      const isOpen = expanded.has(node.path) || node.path === '';
      if (node.path === '' || isOpen) {
        for (const child of Object.values(node.children)) walk(child, depth + (node.path ? 1 : 0));
        for (const f of node.files) out.push({ type: 'file', key: `file:${f.id}`, depth: depth + (node.path ? 1 : 0), file: f });
      }
    }
    walk(root, 0);
    return out;
  }, [root, expanded]);

  const toggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(path)) n.delete(path); else n.add(path);
      return n;
    });
  }, []);

  function statusDot(status: LoadedFile['status']) {
    const map: Record<LoadedFile['status'], { bg: string; shadow: string }> = {
      idle: { bg: 'bg-everforest-grey0', shadow: 'shadow-everforest-grey0/50' },
      parsed: { bg: 'bg-everforest-blue', shadow: 'shadow-everforest-blue/50' },
      converted: { bg: 'bg-everforest-aqua', shadow: 'shadow-everforest-aqua/50' },
      error: { bg: 'bg-everforest-red', shadow: 'shadow-everforest-red/50' },
    };
    const { bg, shadow } = map[status];
    return <span className={`inline-block w-2.5 h-2.5 rounded-full ${bg} shadow-md ${shadow} ring-1 ring-white/50`} aria-hidden />;
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const idx = items.findIndex((it) => it.type === 'file' && it.file.id === selectedId);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items.slice(idx + 1).find((it) => it.type === 'file');
      if (next && next.type === 'file') onSelect(next.file.id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = [...items.slice(0, Math.max(0, idx))].reverse().find((it) => it.type === 'file');
      if (prev && prev.type === 'file') onSelect(prev.file.id);
    }
  }

  return (
    <div className="overflow-auto h-full custom-scrollbar" role="tree" tabIndex={0} onKeyDown={onKeyDown} aria-label="Files">
      <ul className="text-sm p-2">
        {items.map((it) => {
          if (it.type === 'folder') {
            const isOpen = expanded.has(it.node.path) || it.node.path === '';
            return (
              <li key={it.key} role="treeitem" aria-expanded={isOpen} className="select-none">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gradient-to-r hover:from-everforest-bg-blue/20 hover:to-transparent rounded-lg transition-all duration-150 font-medium text-everforest-blue"
                  style={{ paddingLeft: (it.depth + 1) * 12 }}
                  onClick={() => toggle(it.node.path)}
                  aria-label={`Folder ${it.node.name}`}
                >
                  <span className="mr-2 text-everforest-purple">{isOpen ? '▾' : '▸'}</span>
                  {it.node.name || 'Root'}
                </button>
              </li>
            );
          }
          const isSelected = selectedId === it.file.id;
          return (
            <li key={it.key} role="treeitem" aria-selected={isSelected} className="select-none">
              <button
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-150 ${
                  isSelected
                    ? 'bg-gradient-to-r from-everforest-bg-green/30 to-everforest-bg-blue/20 border-l-4 border-everforest-aqua shadow-md font-semibold'
                    : 'border-l-4 border-transparent hover:bg-gradient-to-r hover:from-everforest-bg1 hover:to-transparent hover:border-everforest-grey1'
                }`}
                style={{ paddingLeft: (it.depth + 2) * 12 }}
                onClick={() => onSelect(it.file.id)}
                aria-label={`File ${it.file.name}`}
              >
                <span className="mr-2 inline-flex items-center">{statusDot(it.file.status)}</span>
                <span className={isSelected ? 'text-everforest-fg' : 'text-everforest-fg/90'}>{it.file.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
