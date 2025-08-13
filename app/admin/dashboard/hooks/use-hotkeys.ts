function isInputLike(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return el.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

export default function useHotkeys(
  keys: string | readonly string[],
  callback: HotkeyCallback,
  options?: Options,
  deps?: DependencyList,
) {
  useHotkeysLib(
    keys,
    (event, handler) => {
      if (isInputLike(event.target)) return
      callback(event, handler)
    },
    options,
    deps,
  )
}