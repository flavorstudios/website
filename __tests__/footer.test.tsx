// __tests__/footer.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/footer'
import { SocialIcons, defaultPlatforms } from '@/components/SocialIcons'

describe('Footer', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders all default social links with correct accessible labels and color classes', () => {
    render(<Footer />)
    defaultPlatforms.forEach(({ label, color }) => {
      const anchor = screen.getByLabelText(label)
      expect(anchor).toBeInTheDocument()
      // Always expect text-white (as the fallback class)
      expect(anchor).toHaveClass('text-white')
      // If color is set, expect that class too (color variant is default in Footer)
      if (color) {
        expect(anchor).toHaveClass(color)
      }
    })
  })

  // Test SocialIcons variant="monochrome" separately (isolated responsibility)
  it('renders SocialIcons in monochrome variant without color classes', () => {
    render(<SocialIcons variant="monochrome" />)
    defaultPlatforms.forEach(({ label, color }) => {
      const anchor = screen.getByLabelText(label)
      expect(anchor).toBeInTheDocument()
      // Monochrome variant should NOT have the specific color class
      if (color) {
        expect(anchor).not.toHaveClass(color)
      }
      expect(anchor).toHaveClass('text-white')
    })
  })

  it('matches snapshot', () => {
    const { container } = render(<Footer />)
    expect(container).toMatchSnapshot()
  })
})
