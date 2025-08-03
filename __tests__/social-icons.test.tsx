import React from 'react'
import { render, screen } from '@testing-library/react'
import { SocialIcons, SOCIAL_LINKS } from '@/components/social-icons'

describe('SocialIcons', () => {
  it('uses brand colors when variant="color"', () => {
    render(<SocialIcons variant="color" />)
    SOCIAL_LINKS.forEach((link) => {
      const anchor = screen.getByLabelText(link.name)
      expect(anchor).toHaveStyle({ color: link.color })
    })
  })

  it('defaults to monochrome', () => {
    render(<SocialIcons />)
    SOCIAL_LINKS.forEach((link) => {
      const anchor = screen.getByLabelText(link.name)
      expect(anchor).toHaveClass('text-white')
    })
  })

  it('renders accessible labels and sr-only text', () => {
    render(<SocialIcons />)
    SOCIAL_LINKS.forEach((link) => {
      const anchor = screen.getByLabelText(link.name)
      expect(anchor.getAttribute('aria-label')).toBe(link.name)
      const sr = anchor.querySelector('.sr-only')
      expect(sr).not.toBeNull()
      expect(sr?.textContent).toBe(link.name)
    })
  })

  it('renders links in correct order and hrefs', () => {
    render(<SocialIcons />)
    const anchors = screen.getAllByRole('link')
    expect(anchors).toHaveLength(SOCIAL_LINKS.length)
    anchors.forEach((anchor, index) => {
      expect(anchor).toHaveAttribute('href', SOCIAL_LINKS[index].href)
    })
  })
})