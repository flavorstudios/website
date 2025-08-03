import { render, screen } from '@testing-library/react'
import SocialIcons, { defaultPlatforms, type SocialPlatform } from '@/components/SocialIcons'
import { FaYoutube, FaGithub } from 'react-icons/fa6'

describe('SocialIcons', () => {
  it('renders default platforms with correct aria-labels', () => {
    render(<SocialIcons />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(defaultPlatforms.length)
    defaultPlatforms.forEach(({ label }) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    })
  })

  it('renders custom platforms', () => {
    const customPlatforms: SocialPlatform[] = [
      { label: 'YouTube', href: '#', icon: FaYoutube, color: '#FF0000' },
      { label: 'GitHub', href: '#', icon: FaGithub, color: '#181717' },
    ]

    render(<SocialIcons platforms={customPlatforms} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(customPlatforms.length)
    customPlatforms.forEach(({ label }) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    })
  })

  it('switches between color and monochrome variants', () => {
    const { container: colorContainer } = render(<SocialIcons variant="color" />)
    const colorSvg = colorContainer.querySelector('svg') as SVGElement
    expect(colorSvg).toHaveAttribute('color', defaultPlatforms[0].color)

    const { container: monoContainer } = render(<SocialIcons variant="monochrome" />)
    const monoSvg = monoContainer.querySelector('svg') as SVGElement
    expect(monoSvg).not.toHaveAttribute('color')
  })

  it('applies custom size to icons', () => {
    const size = 32
    const { container } = render(<SocialIcons size={size} />)
    const svg = container.querySelector('svg') as SVGElement
    expect(svg).toHaveAttribute('width', `${size}`)
    expect(svg).toHaveAttribute('height', `${size}`)
  })
})