// __tests__/footer.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/footer'
import { defaultPlatforms } from '@/components/SocialIcons'

describe('Footer', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders all default social links', () => {
    render(<Footer />)
    // Each platform gets a link with an accessible label
    defaultPlatforms.forEach(({ label }) => {
      const anchor = screen.getByLabelText(label)
      expect(anchor).toBeInTheDocument()
      expect(anchor).toHaveClass('text-white')
      // The default (monochrome) mode should NOT set icon color style
      expect(anchor).not.toHaveStyle({ color: expect.any(String) })
    })
  })

  // This test is for SocialIcons color variant directly,
  // not for Footer, since Footer doesn't accept socialVariant prop.
  // You should test SocialIcons separately for this feature.

  it('matches snapshot', () => {
    const { container } = render(<Footer />)
    expect(container).toMatchSnapshot()
  })
})
