import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MediaDetailsPanel from '@/app/admin/dashboard/components/media/MediaDetailsPanel';
import type { MediaDoc } from '@/types/media';

describe('MediaDetailsPanel', () => {
  const media: MediaDoc = {
    id: '1',
    url: '/img.png',
    name: 'img.png',
    mimeType: 'image/png',
    size: 100,
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(() => {
    (global.fetch as any) = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ media }),
    });
  });

  it('autosaves metadata edits', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<MediaDetailsPanel media={media} open onClose={() => {}} />);
    const input = screen.getByLabelText(/ALT Text/i);
    await user.clear(input);
    await user.type(input, 'hello');
    await act(async () => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/media/update',
        expect.objectContaining({ method: 'POST' })
      );
    });
    jest.useRealTimers();
  });

  it('replaces file and updates version history', async () => {
    const newMedia: MediaDoc = {
      ...media,
      url: '/new.png',
      versions: [{ url: media.url, replacedAt: Date.now() }],
    };
    (global.fetch as any) = jest.fn((url: string) => {
      if (url === '/api/media/replace') {
        return Promise.resolve({ json: () => Promise.resolve({ media: newMedia }) });
      }
      return Promise.resolve({ json: () => Promise.resolve({ media }) });
    });
    const user = userEvent.setup();
    render(<MediaDetailsPanel media={media} open onClose={() => {}} />);
    const fileInput = screen.getByLabelText(/Replace File/i) as HTMLInputElement;
    const file = new File(['data'], 'new.png', { type: 'image/png' });
    await user.upload(fileInput, file);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/media/replace', expect.anything());
    });
    expect(screen.getByText(/Version History/i)).toBeInTheDocument();
  });
});