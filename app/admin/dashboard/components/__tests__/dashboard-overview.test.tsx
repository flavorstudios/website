import { render, screen } from '@testing-library/react'
import { DashboardOverview } from '../dashboard-overview'

beforeEach(() => {
  ;(global as any).fetch = jest.fn()
})

test('loads and displays stats', async () => {
  ;(global.fetch as jest.Mock)
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalPosts: 1,
        totalVideos: 2,
        totalComments: 3,
        totalViews: 4,
        pendingComments: 0,
        publishedPosts: 0,
        featuredVideos: 0,
        monthlyGrowth: 0,
      }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ activities: [] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ history: [] }) })

  render(<DashboardOverview />)
  const items = await screen.findAllByText(/Total Posts/i)
  expect(items.length).toBeGreaterThan(0)
  expect(global.fetch).toHaveBeenCalledWith('/api/admin/stats', { credentials: 'include' })
})

test('shows error on unauthorized', async () => {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status: 401,
    json: async () => ({ role: 'user', email: 'a', uid: '1' }),
  })

  render(<DashboardOverview />)
  expect(await screen.findByText(/do not have permission/i)).toBeInTheDocument()
})