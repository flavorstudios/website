import { getMetadata } from '@/lib/seo/metadata'

describe('getMetadata', () => {
  it('handles custom OG image object', () => {
    const ogImageUrl = 'https://example.com/custom.png'
    const result = getMetadata({
      title: 'Page',
      description: 'Description',
      path: '/page',
      ogImage: { url: ogImageUrl, width: 800, height: 600, alt: 'Custom image' },
    })

    expect(result.openGraph?.images?.[0]).toEqual({
      url: ogImageUrl,
      width: 800,
      height: 600,
      alt: 'Custom image',
    })
    expect(result.twitter?.images?.[0]).toBe(ogImageUrl)
  })
})
