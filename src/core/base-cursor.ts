export abstract class BaseCursor {
  static encode<T extends BaseCursor>(cursor: T): string {
    return Buffer.from(JSON.stringify(cursor)).toString('base64url');
  }

  static decode<T extends BaseCursor>(this: new () => T, cursor?: string): T {
    if (!cursor) return new this();

    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString());
    return Object.assign(new this(), parsed);
  }
}
