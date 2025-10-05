import type { LoadedFile } from '@/types';

export interface TreeNode {
  name: string;
  path: string; // directory path relative
  children: Record<string, TreeNode>;
  files: LoadedFile[];
}

export function buildFileTree(files: LoadedFile[]): TreeNode {
  const root: TreeNode = { name: '', path: '', children: {}, files: [] };
  for (const f of files) {
    const parts = f.relativePath.split('/');
    const fileName = parts.pop() || f.name;
    let node = root;
    let acc = '';
    for (const dir of parts) {
      acc = acc ? `${acc}/${dir}` : dir;
      if (!node.children[dir]) {
        node.children[dir] = { name: dir, path: acc, children: {}, files: [] };
      }
      node = node.children[dir];
    }
    node.files.push({ ...f, name: fileName });
  }
  return root;
}

export function countFiles(node: TreeNode): number {
  let count = node.files.length;
  for (const child of Object.values(node.children)) count += countFiles(child);
  return count;
}

export function sortTree(node: TreeNode): void {
  // sort children by name and files by name
  const ordered: Record<string, TreeNode> = {};
  Object.keys(node.children).sort((a, b) => a.localeCompare(b)).forEach((k) => {
    ordered[k] = node.children[k];
  });
  node.children = ordered;
  node.files.sort((a, b) => a.name.localeCompare(b.name));
  for (const child of Object.values(node.children)) sortTree(child);
}
