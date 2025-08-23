import { renderHook, act } from "@testing-library/react";
import { useAutosave } from "./useAutosave";

// mock idb
const put = jest.fn();
const get = jest.fn();
const del = jest.fn();
jest.mock("idb", () => ({
  openDB: () =>
    Promise.resolve({
      put: (...args: any[]) => { put(...args); return Promise.resolve(); },
      get: (...args: any[]) => get(...args),
      delete: (...args: any[]) => { del(...args); return Promise.resolve(); },
    }),
}));

jest.useFakeTimers();

describe("useAutosave", () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    put.mockClear();
    get.mockClear();
    del.mockClear();
  });

  it("stores offline then syncs online", async () => {
    const { result } = renderHook(() =>
      useAutosave({ draftId: "d1", data: { title: "t" } })
    );
    await act(async () => {
      jest.runAllTimers();
    });
    expect(result.current.status).toBe("offline");
    expect(put).toHaveBeenCalled();

    // now go online and return server ok
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ version: 1, savedAtISO: new Date().toISOString() }),
    });
    get.mockResolvedValueOnce({ payload: { title: "t" }, version: undefined });
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      jest.runAllTimers();
    });
    expect(del).toHaveBeenCalled();
    expect(result.current.status).toBe("saved");
  });
});