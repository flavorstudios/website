const originalFetch = global.fetch;

if (typeof originalFetch === 'function') {
  const fontCss = `
@font-face { font-family: 'Poppins'; font-style: normal; font-weight: 400; src: local('Arial'); }
@font-face { font-family: 'Poppins'; font-style: normal; font-weight: 500; src: local('Arial'); }
@font-face { font-family: 'Poppins'; font-style: normal; font-weight: 600; src: local('Arial'); }
@font-face { font-family: 'Poppins'; font-style: normal; font-weight: 700; src: local('Arial'); }
@font-face { font-family: 'Inter'; font-style: normal; font-weight: 400; src: local('Arial'); }
@font-face { font-family: 'Inter'; font-style: normal; font-weight: 500; src: local('Arial'); }
@font-face { font-family: 'Inter'; font-style: normal; font-weight: 600; src: local('Arial'); }
@font-face { font-family: 'Inter'; font-style: normal; font-weight: 700; src: local('Arial'); }
@font-face { font-family: 'Lora'; font-style: normal; font-weight: 400; src: local('Times New Roman'); }
@font-face { font-family: 'JetBrains Mono'; font-style: normal; font-weight: 400; src: local('Courier New'); }
`;

  global.fetch = async (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input && typeof input.url === 'string'
        ? input.url
        : input instanceof URL
        ? input.href
        : undefined;

    if (url && url.startsWith('https://fonts.googleapis.com/')) {
      return new Response(fontCss, {
        status: 200,
        headers: { 'Content-Type': 'text/css' },
      });
    }

    return originalFetch(input, init);
  };
}