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

  it('renders all default social links in monochrome by default', () => {
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

  it('supports color variant for SocialIcons', () => {
    render(<Footer socialVariant="color" />)
    defaultPlatforms.forEach(({ label, color }) => {
      const anchor = screen.getByLabelText(label)
      expect(anchor).toBeInTheDocument()
      // The color variant should apply the brand color via inline style
      expect(anchor).toHaveStyle({ color })
      expect(anchor).not.toHaveClass('text-white')
    })
  })

  it('matches snapshot', () => {
    const { container } = render(<Footer />)
    expect(container).toMatchSnapshot()
  })
})
