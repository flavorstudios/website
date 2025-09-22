const https = require('node:https');
const { EventEmitter } = require('node:events');
const { Buffer } = require('node:buffer');

const originalFetch = global.fetch;
const originalHttpsRequest = https.request.bind(https);
const originalHttpsGet = https.get.bind(https);

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

  const fontCssBuffer = Buffer.from(fontCss);
  const mockFontBinary = Buffer.from('Mock font data');

  const classifyFontRequest = (url) => {
    if (typeof url !== 'string') {
      return undefined;
    }

    try {
      const parsed = new URL(url);
      const host = parsed.hostname;
      const path = (parsed.pathname || '').toLowerCase();

      if (host === 'fonts.googleapis.com') {
        return {
          type: 'stylesheet',
          body: fontCss,
          buffer: fontCssBuffer,
          headers: {
            'Content-Type': 'text/css',
          },
        };
      }

      const isFontHost = host === 'fonts.gstatic.com';
      const isWoff2 = path.endsWith('.woff2');
      const isWoff = path.endsWith('.woff') || isWoff2;

      if (isFontHost && isWoff) {
        return {
          type: 'font',
          body: mockFontBinary,
          buffer: mockFontBinary,
          headers: {
            'Content-Type': isWoff2 ? 'application/font-woff2' : 'application/font-woff',
          },
        };
      }
    } catch (error) {
      // Ignore invalid URL parsing errors and fall through to undefined return.
    }

    return undefined;
  };

  const resolveUrl = (input) => {
    if (typeof input === 'string') {
      return input;
    }
    if (input instanceof URL) {
      return input.href;
    }
    if (input && typeof input === 'object') {
      if (typeof input.url === 'string') {
        return input.url;
      }
      const protocol = input.protocol || 'https:';
      const host = input.hostname || input.host;
      const path = input.path || input.pathname || '';
      if (host) {
        return `${protocol}//${host}${path}`;
      }
    }
    return undefined;
  };

  const createMockRequest = (asset, callback) => {
    const response = new EventEmitter();
    response.statusCode = 200;
    const dataBuffer = Buffer.isBuffer(asset.buffer)
      ? asset.buffer
      : Buffer.from(asset.buffer || asset.body || '');
    response.headers = {
      ...asset.headers,
      'content-length': String(dataBuffer.length),
    };
    response.setEncoding = () => {};
    response.resume = () => {};
    response.pipe = (destination) => {
      destination.write(dataBuffer);
      destination.end();
      return destination;
    };

    const request = new EventEmitter();
    request.write = () => {};
    request.setHeader = () => {};
    request.getHeader = () => undefined;
    request.removeHeader = () => {};
    request.setTimeout = () => {};
    request.abort = () => {};
    request.destroy = () => {};
    request.flushHeaders = () => {};

    request.end = () => {
      process.nextTick(() => {
        if (typeof callback === 'function') {
          callback(response);
        }
        request.emit('response', response);
        response.emit('data', dataBuffer);
        response.emit('end');
        response.emit('close');
        request.emit('finish');
        request.emit('close');
      });
      return request;
    };

    return request;
  };

  global.fetch = async (input, init) => {
    const url = resolveUrl(input);

    const asset = classifyFontRequest(url);

    if (asset) {
      const headers = {
        ...asset.headers,
        'Content-Length': String(asset.buffer.length),
      };
      const body = asset.type === 'stylesheet' ? asset.body : asset.buffer;
      return new Response(body, {
        status: 200,
        headers,
      });
    }

    return originalFetch(input, init);
  };

  const resolveCallback = (options, callback) => {
    if (typeof options === 'function') {
      return options;
    }
    if (typeof callback === 'function') {
      return callback;
    }
    return undefined;
  };

  https.request = (input, options, callback) => {
    const hasExplicitUrl = typeof input === 'string' || input instanceof URL;
    const candidate = hasExplicitUrl ? input : options;
    const url = resolveUrl(hasExplicitUrl ? input : candidate);

    const asset = classifyFontRequest(url);

    if (asset) {
      const cb = resolveCallback(options, callback);
      return createMockRequest(asset, cb);
    }

    return originalHttpsRequest(input, options, callback);
  };

  https.get = (input, options, callback) => {
    const hasExplicitUrl = typeof input === 'string' || input instanceof URL;
    const candidate = hasExplicitUrl ? input : options;
    const url = resolveUrl(hasExplicitUrl ? input : candidate);

    const asset = classifyFontRequest(url);

    if (asset) {
      const req = https.request(input, options, callback);
      req.end();
      return req;
    }

    return originalHttpsGet(input, options, callback);
  };
}
