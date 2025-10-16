import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import type { Response } from "firebase-functions/v2/https";
import { helloTest } from "../functions/src/test";
import { submitContact } from "../functions/src/public/contact";
import { getBlogs } from "../functions/src/public/blogs";
import { getCategories } from "../functions/src/public/categories";

type JsonBody = unknown;

class MockResponse extends EventEmitter {
  public statusCode = 200;
  public body: JsonBody = undefined;
  public headers: Record<string, unknown> = {};
  public headersSent = false;

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  setHeader(name: string, value: unknown) {
    this.headers[name.toLowerCase()] = value;
    return this;
  }

  getHeader(name: string) {
    return this.headers[name.toLowerCase()];
  }

  json(payload: JsonBody) {
    this.body = payload;
    this.headersSent = true;
    this.emit("finish");
    return this;
  }

  end(payload?: JsonBody) {
    this.body = payload;
    this.headersSent = true;
    this.emit("finish");
    return this;
  }
}

async function testHelloFunction() {
  const req = {
    method: "GET",
    headers: { origin: "http://localhost" },
    get(name: string) {
      return (this.headers as Record<string, string>)[name.toLowerCase()];
    }
  };
  const res = new MockResponse();
  await helloTest(req as Parameters<typeof helloTest>[0], res as unknown as Response);

  assert.equal(res.statusCode, 200, "helloTest should default to status 200");
  assert.deepEqual(
    res.body,
    { status: "OK", msg: "Hello from test!" },
    "helloTest should return the expected payload"
  );

  console.log("\u2713 helloTest returns the expected JSON response");
}

function assertHttpsFunctionExport(fn: unknown, name: string) {
  assert.equal(typeof fn, "function", `${name} should be exported as a function`);
  const endpoint = (fn as { __endpoint?: { platform?: string } }).__endpoint;
  assert(endpoint, `${name} should expose Firebase endpoint metadata`);
  assert.equal(
    endpoint?.platform,
    "gcfv2",
    `${name} should target the Firebase v2 runtime`
  );
  console.log(`\u2713 ${name} is configured as a Firebase HTTPS function`);
}

async function main() {
  await testHelloFunction();
  assertHttpsFunctionExport(submitContact, "submitContact");
  assertHttpsFunctionExport(getBlogs, "getBlogs");
  assertHttpsFunctionExport(getCategories, "getCategories");
  console.log("Firebase Functions smoke tests completed successfully\n");
}

main().catch((err) => {
  console.error("Firebase Functions smoke tests failed");
  console.error(err);
  process.exit(1);
});