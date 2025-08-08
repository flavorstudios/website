import { render } from '@testing-library/react'
import MediaGrid from '@/app/admin/dashboard/components/media/MediaGrid'
import MediaList from '@/app/admin/dashboard/components/media/MediaList'
import type { MediaDoc } from '@/types/media'

beforeAll(() => {
  // Mock element dimensions for react-virtual
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 500 })
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1024 })
  // Polyfill ResizeObserver if missing
  if (!(global as any).ResizeObserver) {
    ;(global as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
})

function makeItems(count: number): MediaDoc[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i),
    url: 'https://example.com/' + i,
    createdAt: Date.now(),
    size: 1000,
    mime: 'image/png',
    filename: 'file' + i,
  })) as MediaDoc[]
}

test('grid virtualizes 10k items', () => {
  const items = makeItems(10000)
  const { container } = render(
    <MediaGrid items={items} onSelect={() => {}} onPick={() => {}} selected={new Set()} toggleSelect={() => {}} />
  )
  expect(container.querySelectorAll('button').length).toBeLessThan(500)
})

test('list virtualizes 10k items', () => {
  const items = makeItems(10000)
  const { container } = render(
    <MediaList
      items={items}
      selected={new Set()}
      toggleSelect={() => {}}
      toggleSelectAll={() => {}}
      onRowClick={() => {}}
    />
  )
  expect(container.querySelectorAll('tbody tr').length).toBeLessThan(500)
})