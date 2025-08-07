import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlogManager } from '../blog-manager'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

jest.mock('@/app/admin/actions', () => ({
  revalidateBlogAndAdminDashboard: jest.fn().mockResolvedValue({ message: 'ok' }),
}))

jest.mock('@/components/admin/blog/BlogTable', () => ({
  __esModule: true,
  default: () => <div />,
}))
jest.mock('@/components/admin/blog/BlogBulkActions', () => ({
  __esModule: true,
  default: ({ count }: any) => <div>bulk {count}</div>,
}))
jest.mock('@/components/AdminPageHeader', () => ({
  __esModule: true,
  default: ({ title }: any) => <h1>{title}</h1>,
}))
jest.mock('@/components/ui/category-dropdown', () => ({
  __esModule: true,
  CategoryDropdown: ({ categories, selectedCategory, onCategoryChange, ...props }: any) => (
    <select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)} {...props}>
      {categories.map((c: any) => (
        <option key={c.slug} value={c.slug}>
          {c.name}
        </option>
      ))}
    </select>
  ),
}))
jest.mock('@/components/admin/Pagination', () => ({
  __esModule: true,
  Pagination: ({ currentPage, totalPages }: any) => (
    <div data-testid="pagination">
      {currentPage}/{totalPages}
    </div>
  ),
}))

beforeEach(() => {
  pushMock.mockReset()
  ;(global as any).fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ posts: [] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ categories: [] }) })
})

test('loads data and shows empty state', async () => {
  render(<BlogManager />)
  expect(await screen.findByText(/no blog posts found/i)).toBeInTheDocument()
  expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/admin/blogs', { credentials: 'include' })
  expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/admin/categories?type=blog', { credentials: 'include' })
})

test('navigates to create post page', async () => {
  render(<BlogManager />)
  await screen.findByText(/no blog posts found/i)
  await userEvent.click(screen.getByRole('button', { name: /create new post/i }))
  expect(pushMock).toHaveBeenCalledWith('/admin/blog/create')
})