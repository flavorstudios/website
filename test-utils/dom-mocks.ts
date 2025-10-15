// test-utils/dom-mocks.ts
beforeAll(() => {
  // Stable IntersectionObserver mock
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {return []}
  }
  // @ts-ignore
  global.IntersectionObserver = global.IntersectionObserver ?? IO;

  // requestIdleCallback mock
  // @ts-ignore
  global.requestIdleCallback = global.requestIdleCallback ?? ((cb: any) => setTimeout(() => cb({ didTimeout:false, timeRemaining: () => 16 }), 0));
  // @ts-ignore
  global.cancelIdleCallback = global.cancelIdleCallback ?? ((id: any) => clearTimeout(id));
});
