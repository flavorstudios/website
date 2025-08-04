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

  it('renders all default social links with correct accessible labels, color classes, and focus ring', () => {
    render(<Footer />)
    defaultPlatforms.forEach(({ label, color }) => {
      const anchor = screen.getByLabelText(label)
      expect(anchor).toBeInTheDocument()
      // Always expect text-white (as the fallback class)
      expect(anchor).toHaveClass('text-white')
      // Only expect custom color if not 'text-white'
      if (color && color !== 'text-white') {
        expect(anchor).toHaveClass(color)
      }
      // Ensure focus accessibility classes are present
      expect(anchor).toHaveClass('focus:outline-none')
      expect(anchor).toHaveClass('focus:ring-2')
      expect(anchor).toHaveClass('focus:ring-blue-400')
      expect(anchor).toHaveClass('rounded-full')
    })
  })

  it('renders SocialIcons in monochrome variant without color classes, but with correct focus ring', () => {
    render(<SocialIcons variant="monochrome" />)
    defaultPlatforms.forEach(({ label, color }) => {
      const anchor = screen.getByLabelText(label)
      expect(anchor).toBeInTheDocument()
      // Monochrome variant should NOT have the specific color class if not text-white
      if (color && color !== 'text-white') {
        expect(anchor).not.toHaveClass(color)
      }
      expect(anchor).toHaveClass('text-white')
      // Ensure focus accessibility classes are present
      expect(anchor).toHaveClass('focus:outline-none')
      expect(anchor).toHaveClass('focus:ring-2')
      expect(anchor).toHaveClass('focus:ring-blue-400')
      expect(anchor).toHaveClass('rounded-full')
    })
  })

  it('matches snapshot', () => {
    const { container } = render(<Footer />)
    expect(container).toMatchSnapshot()
  })
})
