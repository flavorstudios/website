import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MediaUpload from '@/app/admin/dashboard/components/media/MediaUpload';
import type Uppy from '@uppy/core';

const handlers: Record<string, Function[]> = {};
const mockUppyInstance = {
  use: jest.fn(),
  on: jest.fn((event: string, cb: Function) => {
    handlers[event] = handlers[event] || [];
    handlers[event].push(cb);
  }),
  addFile: jest.fn(() => 'file1'),
  setFileMeta: jest.fn(),
  pauseResume: jest.fn(),
  removeFile: jest.fn(),
  getFile: jest.fn(() => ({ isPaused: false })),
  close: jest.fn(),
} as unknown as Uppy & { [k: string]: any };

jest.mock('@uppy/core', () => {
  return jest.fn(() => mockUppyInstance);
});
jest.mock('@uppy/xhr-upload', () => jest.fn());

describe('MediaUpload controls', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'crypto', {
      value: { subtle: { digest: () => Promise.resolve(new Uint8Array(1)) } },
      writable: true,
    });
    Object.defineProperty(File.prototype, 'arrayBuffer', {
      value: () => Promise.resolve(new ArrayBuffer(1)),
    });
    mockUppyInstance.pauseResume.mockClear();
    mockUppyInstance.addFile.mockClear();
    mockUppyInstance.getFile.mockReturnValue({ isPaused: false });
  });

  it('allows pausing and resuming', async () => {
    render(<MediaUpload onUploaded={jest.fn()} />);
    const file = new File(['hi'], 'hi.png', { type: 'image/png' });
    const input = screen.getByLabelText(/select media files/i);
    await userEvent.upload(input, file);
    expect(mockUppyInstance.addFile).toHaveBeenCalled();
    expect(await screen.findByText('Pause')).toBeInTheDocument();
    mockUppyInstance.getFile.mockReturnValueOnce({ isPaused: true });
    await userEvent.click(screen.getByText('Pause'));
    expect(mockUppyInstance.pauseResume).toHaveBeenCalled();
    expect(await screen.findByText('Resume')).toBeInTheDocument();
  });
});