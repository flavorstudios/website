import sharp from 'sharp';

process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-bucket';
process.env.FIREBASE_STORAGE_BUCKET = 'test-bucket';

const saveMock = jest.fn();
const downloadMock = jest.fn();

jest.mock('firebase-admin/storage', () => ({
  getStorage: () => ({
    bucket: () => ({
      file: () => ({ save: saveMock, download: downloadMock }),
      name: 'test-bucket',
    }),
  }),
}));

const setMock = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: () => ({
      doc: () => ({
        get: jest.fn().mockResolvedValue({ exists: true, data: () => docData }),
        set: setMock,
      }),
    }),
  },
}));

const docData = {
  id: '1',
  url: 'https://storage.googleapis.com/test-bucket/media/1/original.png',
  mime: 'image/png',
  width: 100,
  height: 100,
  focalPoint: { x: 0.5, y: 0.5 },
  variants: [],
};

let generateResponsiveVariants: any;
let editMedia: any;

beforeAll(async () => {
  const mod = await import('@/lib/media');
  generateResponsiveVariants = mod.generateResponsiveVariants;
  editMedia = mod.editMedia;
});

beforeEach(() => {
  saveMock.mockClear();
  downloadMock.mockClear();
  setMock.mockClear();
});

describe('generateResponsiveVariants', () => {
  it('creates variants for sizes and formats', async () => {
    const buffer = await sharp({ create: { width: 200, height: 200, channels: 3, background: { r: 255, g: 0, b: 0 } } }).png().toBuffer();
    const variants = await generateResponsiveVariants(buffer, '1', { x: 0.5, y: 0.5 });
    expect(variants).toHaveLength(8);
    expect(saveMock).toHaveBeenCalled();
    expect(variants.map(v => `${v.label}.${v.format}`)).toEqual(expect.arrayContaining([
      'thumb.webp','thumb.avif','small.webp','small.avif','medium.webp','medium.avif','large.webp','large.avif'
    ]));
  });
});

describe('editMedia', () => {
  it('persists focal point updates', async () => {
    const buffer = await sharp({ create: { width: 200, height: 200, channels: 3, background: { r: 0, g: 0, b: 255 } } }).png().toBuffer();
    downloadMock.mockResolvedValue([buffer]);
    const media = await editMedia('1', { focalPoint: { x: 0.2, y: 0.8 } });
    expect(media?.focalPoint).toEqual({ x: 0.2, y: 0.8 });
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({ focalPoint: { x: 0.2, y: 0.8 } }),
      { merge: true }
    );
  });
});