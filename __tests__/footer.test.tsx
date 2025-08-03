import React from 'react'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/footer'
import { SOCIAL_LINKS } from '@/components/social-icons'

describe('Footer', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders SocialIcons and defaults to monochrome', () => {
    render(<Footer />)
    const anchor = screen.getByLabelText(SOCIAL_LINKS[0].name)
    expect(anchor).toHaveClass('text-white')
    expect(anchor).not.toHaveStyle({ color: SOCIAL_LINKS[0].color })
  })

  it('supports color variant for SocialIcons', () => {
    render(<Footer socialVariant="color" />)
    const anchor = screen.getByLabelText(SOCIAL_LINKS[0].name)
    expect(anchor).toHaveStyle({ color: SOCIAL_LINKS[0].color })
    expect(anchor).not.toHaveClass('text-white')
  })

  it('matches snapshot', () => {
    const { container } = render(<Footer />)
    expect(container).toMatchSnapshot()
  })
})
