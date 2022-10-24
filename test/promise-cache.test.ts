import {PromiseCache} from '../src/promise-cache';

const sleep = (ms: number, rejects = false) =>
  new Promise((resolve, reject) => setTimeout(rejects ? reject : resolve, ms));

describe('PromiseCache ', () => {
  test('resolves immediately (lazy=false)', async () => {
    const cache = new PromiseCache({
      promiseGenerator: () => Promise.resolve(true),
      options: {
        lazy: false,
      },
    });
    expect(cache.get()).resolves.toBe(true);
  });

  test('resolves immediately (lazy=true)', async () => {
    const cache = new PromiseCache({
      promiseGenerator: () => Promise.resolve(true),
      options: {
        lazy: true,
      },
    });
    expect(cache.get()).resolves.toBe(true);
  });

  // This causes an infinite loop.
  // test('rejects immediately (lazy=false)')

  test('rejects immediately (lazy=true)', async () => {
    const cache = new PromiseCache({
      promiseGenerator: () => Promise.reject(true),
      options: {
        lazy: true,
      },
    });
    expect(cache.get()).rejects.toBe(true);
  });

  test('rejects and then resolves (lazy=false)', async () => {
    let init = true;
    const promiseGenerator = jest.fn(() => {
      if (init) {
        init = false;
        return Promise.reject(true);
      }
      return Promise.resolve(true);
    });
    const cache = new PromiseCache({
      promiseGenerator,
      options: {
        lazy: false,
      },
    });
    expect(cache.get()).rejects.toBe(true);
    await sleep(0);
    expect(promiseGenerator).toBeCalledTimes(2);
    expect(cache.get()).resolves.toBe(true);
  });

  test('rejects and then resolves (lazy=true)', async () => {
    let init = true;
    const promiseGenerator = jest.fn(() => {
      if (init) {
        init = false;
        return Promise.reject(true);
      }
      return Promise.resolve(true);
    });
    const cache = new PromiseCache({
      promiseGenerator,
      options: {
        lazy: true,
      },
    });
    expect(cache.get()).rejects.toBe(true);
    await sleep(0);
    expect(promiseGenerator).toBeCalledTimes(1);
    expect(cache.get()).resolves.toBe(true);
    await sleep(0);
    expect(promiseGenerator).toBeCalledTimes(2);
    expect(cache.get()).resolves.toBe(true);
  });

  test('resolves many times (lazy=false)', async () => {
    const promiseGenerator = jest.fn(() => Promise.resolve(true));
    const cache = new PromiseCache({
      promiseGenerator,
      options: {
        lazy: false,
      },
    });
    await sleep(0);
    expect(promiseGenerator).toBeCalledTimes(1);
    for (let i = 0; i < 10; i++) {
      expect(cache.get()).resolves.toBe(true);
    }
    await sleep(0);
    expect(promiseGenerator).toBeCalledTimes(1);
  });

  test('resolves many times (lazy=true)', async () => {
    const promiseGenerator = jest.fn(() => Promise.resolve(true));
    const cache = new PromiseCache({
      promiseGenerator,
      options: {
        lazy: true,
      },
    });
    await sleep(0);
    expect(promiseGenerator).toBeCalledTimes(0);
    for (let i = 0; i < 10; i++) {
      expect(cache.get()).resolves.toBe(true);
    }
    await sleep(0);
    expect(promiseGenerator).toBeCalledTimes(1);
  });

  test('maxRetries', async () => {
    const promiseGenerator = jest.fn(() => Promise.reject(true));
    const cache = new PromiseCache({
      promiseGenerator,
      options: {
        maxRetries: 2,
      },
    });
    await sleep(0);
    expect(cache.get()).rejects.toBe(true);
    expect(promiseGenerator).toBeCalledTimes(3);
  });

  test('minRetryInterval', async () => {
    let init = true;
    const promiseGenerator = jest.fn(() => {
      if (init) {
        init = false;
        return sleep(20, true); // init -(20ms)-> reject
      }
      return sleep(20); // retry -(20ms)-> resolve
    });
    const cache = new PromiseCache({
      promiseGenerator,
      options: {
        minRetryInterval: 40, // init -(40ms)-> retry
      },
    });

    // init -(20ms)-> reject -(20ms)-> retry -(20ms)-> resolve

    // ---   0 ms ---
    await sleep(0);
    const p0 = cache.get();
    expect(promiseGenerator).toBeCalledTimes(1);
    // ---  10 ms ---
    await sleep(10);
    const p1 = cache.get();
    expect(promiseGenerator).toBeCalledTimes(1);
    // ---  30 ms ---
    await sleep(20);
    const p2 = cache.get();
    expect(promiseGenerator).toBeCalledTimes(1);
    // --- 50 ms ---
    await sleep(20);
    const p3 = cache.get();
    expect(promiseGenerator).toBeCalledTimes(2);

    expect(p0).rejects.toBe(undefined);
    expect(p1).rejects.toBe(undefined);
    expect(p2).resolves.toBe(undefined);
    expect(p3).resolves.toBe(undefined);
  });
});
