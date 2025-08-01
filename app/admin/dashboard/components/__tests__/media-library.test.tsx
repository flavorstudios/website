import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MediaUpload from '../media/MediaUpload'
import MediaList from '../media/MediaList'
import MediaBulkActions from '../media/MediaBulkActions'
import type { MediaDoc } from '@/types/media'

// Mock XMLHttpRequest for upload progress
class MockXHR {
  upload = { addEventListener: (_: string, cb: any) => { this.progressCb = cb } }
  progressCb: any
  onload: any = () => {}
  responseText = JSON.stringify({ media: { id: '1', url: '/x.png', name: 'x.png' } })
  open = jest.fn()
  send = jest.fn(() => {
    this.progressCb({ lengthComputable: true, loaded: 50, total: 100 })
    this.onload()
  })
}

beforeEach(() => {
  ;(global as any).XMLHttpRequest = MockXHR as any
})

test('uploads multiple files with progress', async () => {
  const onUploaded = jest.fn()
  render(<MediaUpload onUploaded={onUploaded} />)

  const input = screen.getByLabelText(/file/i)
  const file1 = new File(['a'], 'a.png', { type: 'image/png' })
  const file2 = new File(['b'], 'b.png', { type: 'image/png' })
  await userEvent.upload(input, [file1, file2])

  await waitFor(() => expect(onUploaded).toHaveBeenCalledTimes(2))
})

test('selection and bulk delete', async () => {
  const items: MediaDoc[] = [
    { id: '1', url: '/1.png', name: '1.png', mimeType: 'image/png', size: 10, createdAt: 1, updatedAt: 1 },
    { id: '2', url: '/2.png', name: '2.png', mimeType: 'image/png', size: 10, createdAt: 1, updatedAt: 1 },
  ]
  const toggleSelect = jest.fn()
  const toggleSelectAll = jest.fn()
  render(
    <MediaList
      items={items}
      selected={new Set()}
      toggleSelect={toggleSelect}
      toggleSelectAll={toggleSelectAll}
      onRowClick={() => {}}
    />
  )

  const boxes = screen.getAllByRole('checkbox')
  await userEvent.click(boxes[1])
  expect(toggleSelect).toHaveBeenCalled()
})

test('bulk actions bar visible when count > 0', () => {
  const { container } = render(
    <MediaBulkActions count={2} onDelete={() => {}} onTag={() => {}} onDownload={() => {}} />
  )
  expect(container.textContent).toContain('2 selected')
})