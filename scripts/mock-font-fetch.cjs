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

  const isFontUrl = (url) =>
    typeof url === 'string' && url.startsWith('https://fonts.googleapis.com/');

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

  const createMockFontResponse = (callback) => {
    const response = new EventEmitter();
    response.statusCode = 200;
    response.headers = { 'content-type': 'text/css' };
    response.setEncoding = () => {};
    response.resume = () => {};
    response.pipe = (destination) => {
      destination.write(fontCss);
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
        response.emit('data', Buffer.from(fontCss));
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

    if (isFontUrl(url)) {
      return new Response(fontCss, {
        status: 200,
        headers: { 'Content-Type': 'text/css' },
      });
    }

    return originalFetch(input, init);
  };

  https.request = (input, options, callback) => {
    const hasExplicitUrl = typeof input === 'string' || input instanceof URL;
    const candidate = hasExplicitUrl ? input : options;
    const url = resolveUrl(hasExplicitUrl ? input : candidate);

    if (isFontUrl(url)) {
      const cb = hasExplicitUrl ? options : callback;
      return createMockFontResponse(cb);
    }

    return originalHttpsRequest(input, options, callback);
  };

  https.get = (input, options, callback) => {
    const hasExplicitUrl = typeof input === 'string' || input instanceof URL;
    const candidate = hasExplicitUrl ? input : options;
    const url = resolveUrl(hasExplicitUrl ? input : candidate);

    if (isFontUrl(url)) {
      const req = https.request(input, options, callback);
      req.end();
      return req;
    }

    return originalHttpsGet(input, options, callback);
  };
}
