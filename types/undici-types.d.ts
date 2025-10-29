declare module "undici-types" {
  type BodyInit = unknown;
  type FormDataEntryValue = unknown;
  type Blob = unknown;

  export class Headers {
    constructor(init?: Headers | Record<string, string> | Array<[string, string]>);
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callback: (value: string, name: string) => void): void;
  }

  export interface RequestInit {
    method?: string;
    headers?: Headers | Record<string, string> | Array<[string, string]>;
    body?: BodyInit | null;
  }

  export class Request {
    constructor(input: string | URL | Request, init?: RequestInit);
    readonly url: string;
    readonly method: string;
    readonly headers: Headers;
  }

  export interface ResponseInit {
    status?: number;
    statusText?: string;
    headers?: Headers | Record<string, string> | Array<[string, string]>;
  }

  export class Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
    readonly status: number;
    readonly statusText: string;
    readonly headers: Headers;
  }

  export class FormData {
    append(name: string, value: string | Blob, fileName?: string): void;
    get(name: string): FormDataEntryValue | null;
    has(name: string): boolean;
    set(name: string, value: string | Blob, fileName?: string): void;
    delete(name: string): void;
    entries(): IterableIterator<[string, FormDataEntryValue]>;
  }

  export interface EventInit {
    bubbles?: boolean;
    cancelable?: boolean;
  }

  export class MessageEvent<T = unknown> {
    constructor(type: string, eventInitDict?: EventInit & { data?: T });
    readonly data: T;
  }

  export class CloseEvent {
    constructor(type: string, eventInitDict?: EventInit & { code?: number; reason?: string; wasClean?: boolean });
  }

  export class EventSource {
    constructor(url: string, eventSourceInitDict?: { withCredentials?: boolean });
    close(): void;
  }

  export class WebSocket {
    constructor(url: string, protocols?: string | string[]);
    close(code?: number, reason?: string): void;
  }
}