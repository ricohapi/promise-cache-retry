import {PromiseCache} from '../src/promise-cache';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    await sleep(1);
    expect(promiseGenerator).toBeCalledTimes(2);
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
    await sleep(1);
    expect(promiseGenerator).toBeCalledTimes(1);
  });

  test('resolves many times (lazy=false)', async () => {
    const promiseGenerator = jest.fn(() => Promise.resolve(true));
    const cache = new PromiseCache({
      promiseGenerator,
      options: {
        lazy: false,
      },
    });
    for (let i = 0; i < 10; i++) {
      expect(cache.get()).resolves.toBe(true);
    }
    await sleep(1);
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
    for (let i = 0; i < 10; i++) {
      expect(cache.get()).resolves.toBe(true);
    }
    await sleep(1);
    expect(promiseGenerator).toBeCalledTimes(1);
  });
});
