expect(result.openGraph.images[0]).toEqual({
      url: ogImageUrl,
      width: 800,
      height: 600,
      alt: 'Custom image',
    });
    expect(result.twitter.images[0]).toBe(ogImageUrl);
  });
});