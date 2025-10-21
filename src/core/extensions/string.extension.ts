export {};

declare global {
  interface String {
    lowercasedEquals(other: string | undefined): boolean;
    hasValue(): boolean;
  }
}

String.prototype.lowercasedEquals = function (this: string | undefined, other: string | undefined): boolean {
  if (this === undefined || other === undefined) return false;
  return this.toLowerCase() === other.toLowerCase();
};

String.prototype.hasValue = function (this: string | undefined | null): boolean {
  return this !== undefined && this !== null && this.length > 0;
};
