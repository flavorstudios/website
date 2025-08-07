import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminHeader } from '../admin-header'

beforeEach(() => {
  ;(global as any).fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ notifications: [] }),
  })
})

test('invokes callbacks on interaction', async () => {
  const onLogout = jest.fn()
  const setSidebarOpen = jest.fn()
  const onShowHelp = jest.fn()

  render(
    <AdminHeader
      onLogout={onLogout}
      sidebarOpen={false}
      setSidebarOpen={setSidebarOpen}
      onShowHelp={onShowHelp}
    />
  )

  await userEvent.click(screen.getByLabelText(/open sidebar/i))
  expect(setSidebarOpen).toHaveBeenCalledWith(true)

  await userEvent.click(screen.getByLabelText(/logout/i))
  expect(onLogout).toHaveBeenCalled()

  await userEvent.click(screen.getByLabelText(/keyboard shortcuts/i))
  expect(onShowHelp).toHaveBeenCalled()
})

test('opens external site', async () => {
  const onLogout = jest.fn()
  const setSidebarOpen = jest.fn()
  const onShowHelp = jest.fn()
  const open = jest.spyOn(window, 'open').mockImplementation(() => null)

  render(
    <AdminHeader
      onLogout={onLogout}
      sidebarOpen={false}
      setSidebarOpen={setSidebarOpen}
      onShowHelp={onShowHelp}
    />
  )

  await userEvent.click(screen.getByRole('button', { name: /view site/i }))
  expect(open).toHaveBeenCalled()

  open.mockRestore()
})