export * from "./common"

function isArrayBuffer(input: ArrayBuffer | Uint8Array): input is ArrayBuffer {
  return (
    input instanceof ArrayBuffer ||
    Object.prototype.toString.call(input) === "[object ArrayBuffer]"
  )
}

function toArrayBuffer(input: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (isArrayBuffer(input)) {
    return input
  }
  return input.slice().buffer
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function sha1(bytes: Uint8Array): Uint8Array {
  const length = bytes.length
  const words = new Array<number>((((length + 8) >> 6) + 1) * 16).fill(0)
  for (let i = 0; i < length; i += 1) {
    const byte = bytes[i] ?? 0
    const index = i >> 2
    const existingWord = words[index] ?? 0
    words[index] = existingWord | (byte << ((3 - (i & 3)) * 8))
  }
  const finalIndex = length >> 2
  const finalWord = words[finalIndex] ?? 0
  words[finalIndex] = finalWord | (0x80 << ((3 - (length & 3)) * 8))
  words[words.length - 1] = length * 8

  let h0 = 0x67452301
  let h1 = 0xefcdab89
  let h2 = 0x98badcfe
  let h3 = 0x10325476
  let h4 = 0xc3d2e1f0

  const w = new Array<number>(80)

  const readWord = (index: number): number => w[index] ?? 0

  for (let i = 0; i < words.length; i += 16) {
    for (let t = 0; t < 16; t += 1) {
      w[t] = words[i + t] ?? 0
    }
    for (let t = 16; t < 80; t += 1) {
      const val = (readWord(t - 3) ^ readWord(t - 8) ^ readWord(t - 14) ^ readWord(t - 16)) >>> 0
      w[t] = ((val << 1) | (val >>> 31)) >>> 0
    }

    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4

    for (let t = 0; t < 80; t += 1) {
      let f: number
      let k: number
      if (t < 20) {
        f = (b & c) | (~b & d)
        k = 0x5a827999
      } else if (t < 40) {
        f = b ^ c ^ d
        k = 0x6ed9eba1
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d)
        k = 0x8f1bbcdc
      } else {
        f = b ^ c ^ d
        k = 0xca62c1d6
      }

      const word = readWord(t)
      const temp = ((((a << 5) | (a >>> 27)) + f + e + k + word) >>> 0) >>> 0
      e = d
      d = c
      c = ((b << 30) | (b >>> 2)) >>> 0
      b = a
      a = temp
    }

    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
  }

  const result = new Uint8Array(20)
  const digestWords = [h0, h1, h2, h3, h4]
  for (let i = 0; i < digestWords.length; i += 1) {
    const word = digestWords[i] ?? 0
    result[i * 4] = (word >>> 24) & 0xff
    result[i * 4 + 1] = (word >>> 16) & 0xff
    result[i * 4 + 2] = (word >>> 8) & 0xff
    result[i * 4 + 3] = word & 0xff
  }
  return result
}

export async function hashAvatar(buffer: ArrayBuffer | Uint8Array): Promise<string> {
  const data = toArrayBuffer(buffer)
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-1", data)
    return toHex(new Uint8Array(digest))
  }

  return toHex(sha1(buffer instanceof Uint8Array ? buffer : new Uint8Array(data)))
}