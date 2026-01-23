import { createHash } from 'crypto';

/**
 * A simple, performant Bloom filter implementation.
 * Uses SHA-256 to generate k hash values from a single hash.
 */
export class BloomFilter {
  private bits: Uint8Array;
  private readonly numBits: number;
  private readonly numHashes: number;

  /**
   * @param numBits - Size of bit array (m). Default 8192 bits = 1KB.
   *                  Provides ~0.2% false positive rate for 500 items.
   * @param numHashes - Number of hash functions (k). Default 7.
   */
  constructor(numBits = 8192, numHashes = 7) {
    this.numBits = numBits;
    this.numHashes = numHashes;
    this.bits = new Uint8Array(Math.ceil(numBits / 8));
  }

  /**
   * Add a key to the filter.
   */
  add(key: string): void {
    const hashes = this._getHashes(key);
    for (const hash of hashes) {
      const index = hash % this.numBits;
      this.bits[Math.floor(index / 8)] |= 1 << index % 8;
    }
  }

  /**
   * Check if a key might be in the filter.
   * False positives possible, false negatives impossible.
   */
  has(key: string): boolean {
    const hashes = this._getHashes(key);
    for (const hash of hashes) {
      const index = hash % this.numBits;
      if ((this.bits[Math.floor(index / 8)] & (1 << index % 8)) === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Serialize the filter to a base64 string.
   */
  serialize(): string {
    return Buffer.from(this.bits).toString('base64');
  }

  /**
   * Get filter parameters for cursor storage.
   */
  getParams(): { bitArraySize: number; hashFunctionsCount: number } {
    return { bitArraySize: this.numBits, hashFunctionsCount: this.numHashes };
  }

  /**
   * Deserialize a filter from base64 string.
   */
  static deserialize(base64: string, numBits: number, numHashes: number): BloomFilter {
    const filter = new BloomFilter(numBits, numHashes);
    filter.bits = new Uint8Array(Buffer.from(base64, 'base64'));
    return filter;
  }

  /**
   * Generate k hash values from a single SHA-256 hash.
   * Uses double hashing: h(i) = h1 + i * h2
   */
  private _getHashes(key: string): number[] {
    const hash = createHash('sha256').update(key).digest();
    const primaryHash = hash.readUInt32BE(0);
    const secondaryHash = hash.readUInt32BE(4);

    const hashes: number[] = [];
    for (let hashIndex = 0; hashIndex < this.numHashes; hashIndex++) {
      hashes.push((primaryHash + hashIndex * secondaryHash) >>> 0); // Unsigned 32-bit
    }
    return hashes;
  }
}
