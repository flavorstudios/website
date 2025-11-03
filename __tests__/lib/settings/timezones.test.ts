import {
  DEFAULT_TIMEZONES,
  areTimezonesEqual,
  readRuntimeTimezones,
} from "@/lib/settings/timezones"

describe("timezones utilities", () => {
  const originalIntl = global.Intl

  afterEach(() => {
    global.Intl = originalIntl
  })

  test("readRuntimeTimezones returns empty list when Intl unsupported", () => {
    // @ts-expect-error – simulate environment without Intl
    global.Intl = undefined
    expect(readRuntimeTimezones()).toEqual([])
  })

  test("readRuntimeTimezones normalises duplicates", () => {
    global.Intl = {
      ...originalIntl,
      supportedValuesOf: () => ["UTC", "UTC", "Asia/Tokyo"],
    } as unknown as typeof Intl

    expect(readRuntimeTimezones()).toEqual(["UTC", "Asia/Tokyo"])
  })

  test("areTimezonesEqual recognises identical arrays", () => {
    expect(areTimezonesEqual(DEFAULT_TIMEZONES, [...DEFAULT_TIMEZONES])).toBe(true)
    expect(areTimezonesEqual(["UTC"], ["UTC", "Asia/Tokyo"])).toBe(false)
    expect(areTimezonesEqual(["UTC", "Asia/Tokyo"], ["UTC", "Europe/London"]))
      .toBe(false)
  })
})