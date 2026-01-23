import { deflateSync, inflateSync } from 'zlib';

export abstract class BaseCursor {
  static encode<T extends BaseCursor>(cursor: T): string {
    const json = JSON.stringify(cursor);
    const compressed = deflateSync(Buffer.from(json, 'utf-8'), { level: 9 });
    return compressed.toString('base64url');
  }

  static decode<T extends BaseCursor>(this: new () => T, cursor?: string): T {
    if (!cursor) return new this();

    const compressed = Buffer.from(cursor, 'base64url');
    const json = inflateSync(compressed).toString('utf-8');
    const parsed = JSON.parse(json);
    return Object.assign(new this(), parsed);
  }
}
