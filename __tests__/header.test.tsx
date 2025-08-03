import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/header';

jest.mock('@/components/mega-menu', () => ({
  MegaMenu: () => <div data-testid="mega-menu" />,
}));
jest.mock('@/components/mobile-mega-menu', () => ({
  MobileMegaMenu: () => <div data-testid="mobile-mega-menu" />,
}));
jest.mock('@/components/ui/search-feature', () => ({
  SearchFeature: () => <div data-testid="search-feature" />,
}));

describe('Header', () => {
  it('renders site title and CTA link', () => {
    render(<Header />);

    expect(screen.getByText('Flavor Studios')).toBeInTheDocument();
    expect(screen.getByText('Buy Me a Coffee')).toBeInTheDocument();
    expect(screen.getByTestId('mega-menu')).toBeInTheDocument();
    expect(screen.getAllByTestId('search-feature')).toHaveLength(2);
  });
});