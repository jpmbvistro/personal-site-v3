import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import { rename, unlink, writeFile } from 'node:fs/promises';

// A truncate/rewrite can let Tina's watcher index an empty document and miss
// the completed write. Rename complete bytes over the target instead. Keep
// the temporary file outside the collection's .md/.mdx extension patterns.
export async function writeContent(path: URL, content: string) {
  const temporary = new URL(`.${basename(path.pathname)}.${randomUUID()}.tmp`, path);
  try {
    await writeFile(temporary, content, { flag: 'wx' });
    await rename(temporary, path);
  } finally {
    await unlink(temporary).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}
