export interface PromiseCacheOptions {
  lazy: boolean;
}

export interface PromiseCacheProps<T> {
  promiseGenerator: () => Promise<T>;
  options?: Partial<PromiseCacheOptions>;
}

export class PromiseCache<T> {
  private readonly promiseGenerator: () => Promise<T>;
  private readonly options: PromiseCacheOptions;
  private p: Promise<T> | null = null;

  constructor({promiseGenerator, options = {}}: PromiseCacheProps<T>) {
    const defaultOptions: PromiseCacheOptions = {
      lazy: false,
    };
    this.promiseGenerator = promiseGenerator;
    this.options = {
      ...defaultOptions,
      ...options,
    };
  }

  /**
   * Get a promise.
   * This method returns the cached value if it has been processed or already resolved successfully.
   * The cache is automatically cleaned up if the promise is rejected.
   * @returns Promise
   */
  get(): Promise<T> {
    // Return a cached promise if exists.
    if (this.p) return this.p;
    // Create new promise.
    const p = this.promiseGenerator();
    p.catch(() => {
      // Clean cache if an error occurs.
      this.p = null;
      // Request new promise if options.lazy is false.
      if (!this.options.lazy) this.get();
    });
    // Update cache.
    this.p = p;
    return p;
  }
}
