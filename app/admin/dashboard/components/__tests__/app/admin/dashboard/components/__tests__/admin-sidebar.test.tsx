import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminSidebar } from '../admin-sidebar'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

jest.mock('../../contexts/role-context', () => ({
  useRole: () => ({ accessibleSections: ['blogs'] }),
}))

jest.mock('next/navigation', () => ({
  usePathname: () => '/admin/dashboard/blog-posts',
}))

beforeEach(() => {
  ;(global as any).fetch = jest.fn()
  window.innerWidth = 1024
})

test('renders allowed items and toggles sidebar', async () => {
  const setSidebarOpen = jest.fn()
  render(
    <AdminSidebar
      activeSection=""
      setActiveSection={() => {}}
      sidebarOpen={true}
      setSidebarOpen={setSidebarOpen}
    />
  )

  expect(screen.getByRole('link', { name: /blog posts/i })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /videos/i })).not.toBeInTheDocument()

  await userEvent.click(screen.getByLabelText(/close sidebar/i))
  expect(setSidebarOpen).toHaveBeenCalledWith(false)
})