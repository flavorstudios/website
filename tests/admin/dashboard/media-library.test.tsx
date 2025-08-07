import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MediaUpload from '@/app/admin/dashboard/components/media/MediaUpload';
import MediaList from '@/app/admin/dashboard/components/media/MediaList';
import MediaBulkActions from '@/app/admin/dashboard/components/media/MediaBulkActions';
import type { MediaDoc } from '@/types/media';

// Mock XMLHttpRequest for upload progress
class MockXHR {
  upload = {
    addEventListener: (_: string, cb: (ev: ProgressEvent<EventTarget>) => void) => {
      this.progressCb = cb;
    },
  };
  progressCb: (ev: ProgressEvent<EventTarget>) => void = () => {};
  onload: () => void = () => {};
  responseText = JSON.stringify({ media: { id: '1', url: '/x.png', name: 'x.png' } });
  open = jest.fn();
  send = jest.fn(() => {
    // Fire progress event for each upload (simulate 50% progress)
    this.progressCb({ lengthComputable: true, loaded: 50, total: 100 } as ProgressEvent<EventTarget>);
    this.onload();
  });
}

beforeEach(() => {
  // Set global XMLHttpRequest mock before each test
  (global as any).XMLHttpRequest = MockXHR as any;
});
