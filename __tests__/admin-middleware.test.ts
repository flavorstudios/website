import type { NextRequest } from 'next/server'

describe('middleware admin verification routing', () => {
  const buildRequest = (path: string, cookieHeader?: string) => {
    const headers = new Headers()
    const cookieMap = new Map<string, string>()
    if (cookieHeader) {
      headers.set('cookie', cookieHeader)
      cookieHeader.split(';').forEach((pair) => {
        const [rawName, rawValue] = pair.split('=')
        if (!rawName) return
        cookieMap.set(rawName.trim(), (rawValue ?? '').trim())
      })
    }
    const url = new URL(`http://localhost${path}`)
    const cookies = {
      get: (name: string) => {
        const value = cookieMap.get(name)
        return value ? { name, value } : undefined
      },
      has: (name: string) => cookieMap.has(name),
    }

    return {
      url: url.toString(),
      nextUrl: url,
      headers,
      cookies,
    } as unknown as NextRequest
  }

  beforeEach(() => {
    jest.resetModules()
    process.env.ADMIN_REQUIRE_EMAIL_VERIFICATION = 'true'
    process.env.ADMIN_AUTH_DISABLED = '0'
  })

  it('redirects sessions without a verification cookie to the verify page', async () => {
    const { middleware } = await import('../middleware')
    const request = buildRequest('/admin/dashboard', 'admin-session=test')

    const response = await middleware(request)

    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe(
      'http://localhost/admin/verify-email'
    )
  })

  it('redirects unverified sessions away from protected admin routes', async () => {
    const { middleware } = await import('../middleware')
    const request = buildRequest(
      '/admin/dashboard',
      'admin-session=test; admin-email-verified=false'
    )
    const response = await middleware(request)
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe(
      'http://localhost/admin/verify-email'
    )
  })

  it('allows unverified sessions to remain on verify page', async () => {
    const { middleware } = await import('../middleware')
    const request = buildRequest(
      '/admin/verify-email',
      'admin-session=test; admin-email-verified=false'
    )
    const response = await middleware(request)
    expect(response?.status).toBe(200)
  })

  it('redirects verified sessions away from the verify page', async () => {
    const { middleware } = await import('../middleware')
    const request = buildRequest(
      '/admin/verify-email',
      'admin-session=test; admin-email-verified=true'
    )
    const response = await middleware(request)
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe(
      'http://localhost/admin/dashboard'
    )
  })
})