export interface PromiseCacheOptions {
  /**
   * If `lazy` is `true`, no cache is created unless you call `this.get`.
   * Otherwise, the cache is pre-built.
   * @default false
   */
  lazy: boolean;
  /**
   * Maximum number of retries.
   * @default Number.POSITIVE_INFINITY
   */
  maxRetries: number;
  /**
   * Minimum number of milliseconds between calls of `promiseGenerator`.
   * @default 0
   */
  minRetryInterval: number;
}

export interface PromiseCacheProps<T> {
  promiseGenerator: () => Promise<T>;
  options?: Partial<PromiseCacheOptions>;
}

export class PromiseCache<T> {
  private readonly promiseGenerator: () => Promise<T>;
  private readonly options: PromiseCacheOptions;
  private cache: Promise<T> | null = null;
  private promiseCreatedAt: Date | null = null;
  private numRetries = 0;

  constructor({promiseGenerator, options = {}}: PromiseCacheProps<T>) {
    const defaultOptions: PromiseCacheOptions = {
      lazy: false,
      maxRetries: Number.POSITIVE_INFINITY,
      minRetryInterval: 0,
    };
    this.promiseGenerator = promiseGenerator;
    this.options = {
      ...defaultOptions,
      ...options,
    };
    if (!this.options.lazy) this.get();
  }

  /**
   * Get a promise.
   * This method returns the cached value if it has been processed or already resolved successfully.
   * The cache is automatically cleaned up if the promise is rejected.
   * @returns Promise
   */
  get(): Promise<T> {
    if (this.cache) return this.cache;

    const cache = this.createNextCache();

    cache.catch(() => this.retry());

    this.cache = cache;
    return cache;
  }

  private createNextCache(): Promise<T> {
    const waitFor =
      (this.promiseCreatedAt?.valueOf() ?? 0) +
      this.options.minRetryInterval -
      Date.now();
    if (waitFor <= 0) {
      this.promiseCreatedAt = new Date();
      return this.promiseGenerator();
    }
    return new Promise<T>((resolve, reject) =>
      setTimeout(() => {
        this.promiseCreatedAt = new Date();
        this.promiseGenerator().then(resolve).catch(reject);
      }, waitFor)
    );
  }

  private retry() {
    this.numRetries += 1;
    if (this.numRetries > this.options.maxRetries) return;
    this.cache = null;
    if (!this.options.lazy) this.get();
  }
}
