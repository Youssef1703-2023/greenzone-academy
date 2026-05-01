import { createHash } from 'node:crypto';

export function hashContent(content: unknown) {
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}
