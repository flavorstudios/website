import React, { useEffect } from 'react'
import { act, render } from '@testing-library/react'

const mockSyncAdminSession = jest.fn()

jest.mock('@/lib/admin-session-sync', () => ({
  syncAdminSession: (...args: unknown[]) => mockSyncAdminSession(...args),
}))

describe('AdminAuthProvider access state', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION = 'true'
    process.env.NEXT_PUBLIC_TEST_MODE = '0'
    process.env.NEXT_PUBLIC_E2E = 'false'
    process.env.E2E = 'false'
    mockSyncAdminSession.mockResolvedValue(true)
    ;(global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ serverStateKnown: true, serverVerified: false }),
    })
  })

  it('promotes access state when the same user reference becomes verified', async () => {
    const mockUser: any = {
      uid: 'test-user',
      emailVerified: false,
      reload: jest.fn(),
      getIdToken: jest.fn(),
    }
    let listener: ((user: any) => void) | null = null

    jest.doMock('firebase/auth', () => ({
      onAuthStateChanged: (_auth: unknown, cb: (user: any) => void) => {
        listener = cb
        return () => {}
      },
      signOut: jest.fn(),
    }))

    jest.doMock('@/lib/firebase', () => ({
      getFirebaseAuth: () => ({ currentUser: mockUser }),
      firebaseInitError: null,
    }))

    jest.doMock('next/navigation', () => ({
      useRouter: () => ({ replace: jest.fn() }),
      usePathname: () => '/admin/verify-email',
    }))

    const { AdminAuthProvider, useAdminAuth } = await import(
      '@/components/AdminAuthProvider'
    )

    const observedStates: string[] = []

    function Observer() {
      const { accessState } = useAdminAuth()
      useEffect(() => {
        observedStates.push(accessState)
      }, [accessState])
      return null
    }

    render(
      <AdminAuthProvider>
        <Observer />
      </AdminAuthProvider>
    )

    expect(listener).toBeTruthy()

    await act(async () => {
      listener?.(mockUser)
    })

    expect(observedStates.at(-1)).toBe('authenticated_unverified')

    await act(async () => {
      mockUser.emailVerified = true
      listener?.(mockUser)
    })

    expect(observedStates.at(-1)).toBe('authenticated_verified')
  })
})