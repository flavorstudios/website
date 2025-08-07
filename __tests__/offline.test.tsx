/** @jest-environment node */
import React from 'react';
import { renderToString } from 'react-dom/server';
import OfflinePage from '../page';
import OfflinePage from '../app/offline/page';

describe('Offline page static render', () => {
  it('pre-renders without crashing and includes offline text', () => {
    const html = renderToString(<OfflinePage />);
    expect(html).toContain('Offline');
  });
});