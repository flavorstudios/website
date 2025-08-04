import { render, screen } from '@testing-library/react'
import SocialIcons, { defaultPlatforms, type SocialPlatform } from '@/components/SocialIcons'
import { FaYoutube, FaGithub } from 'react-icons/fa6'

describe('SocialIcons', () => {
  it('renders all default platforms as links with correct unique aria-labels', () => {
    render(<SocialIcons />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(defaultPlatforms.length)

    // Ensure no duplicate labels and all are present
    const seenLabels = new Set<string>()
    defaultPlatforms.forEach(({ label }) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
      expect(seenLabels.has(label)).toBe(false)
      seenLabels.add(label)
    })
  })

  it('renders custom platforms and respects aria-label uniqueness', () => {
    const customPlatforms: SocialPlatform[] = [
      { label: 'YouTube', href: '#', icon: FaYoutube, color: '#FF0000' },
      { label: 'GitHub', href: '#', icon: FaGithub, color: '#181717' },
    ]

    render(<SocialIcons platforms={customPlatforms} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(customPlatforms.length)

    // Check aria-label for each custom platform
    const seenCustomLabels = new Set<string>()
    customPlatforms.forEach(({ label }) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
      expect(seenCustomLabels.has(label)).toBe(false)
      seenCustomLabels.add(label)
    })
  })

  it('switches icon color based on variant prop', () => {
    // Color variant: check SVG for Tailwind class or color attribute
    const { container: colorContainer } = render(<SocialIcons variant="color" />)
    const colorSvgs = colorContainer.querySelectorAll('svg')
    expect(colorSvgs.length).toBeGreaterThan(0)
    colorSvgs.forEach((svg, idx) => {
      const color = defaultPlatforms[idx]?.color
      if (color) {
        if (color.startsWith("#")) {
          expect(svg).toHaveAttribute('color', color)
        } else {
          expect(svg).toHaveClass(color)
        }
      }
    })

    // Monochrome variant: no Tailwind color class or color attribute
    const { container: monoContainer } = render(<SocialIcons variant="monochrome" />)
    const monoSvgs = monoContainer.querySelectorAll('svg')
    monoSvgs.forEach((svg, idx) => {
      const color = defaultPlatforms[idx]?.color
      if (color) {
        if (color.startsWith("#")) {
          expect(svg.hasAttribute('color')).toBe(false)
        } else {
          expect(svg).not.toHaveClass(color)
        }
      }
    })
  })

  it('applies custom size to all icons', () => {
    const size = 32
    const { container } = render(<SocialIcons size={size} />)
    const svgs = container.querySelectorAll('svg')
    svgs.forEach(svg => {
      expect(svg).toHaveAttribute('width', `${size}`)
      expect(svg).toHaveAttribute('height', `${size}`)
    })
  })

  // OPTIONAL: Audit-proof assertion for container class
  it('uses horizontal gap-x-2 class on container for spacing', () => {
    const { container } = render(<SocialIcons />)
    // The container should have gap-x-2 (horizontal spacing)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toMatch(/gap-x-2/)
  })
})
