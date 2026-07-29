// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/font/google', () => ({
    Sora: () => ({ variable: '--font-sora' }),
}));
vi.mock('../app/globals.css', () => ({}));

const PrivacyPolicy = (await import('../app/privacy/page.js')).default;
const Terms = (await import('../app/terms/page.js')).default;
const { metadata } = await import('../app/layout.js');

describe('privacy policy page', () => {
    it('documents the PDPA sections a Singapore business must publish', () => {
        render(<PrivacyPolicy />);

        expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
        [
            '1. Introduction',
            '2. Personal Data We Collect',
            '3. How We Use Your Data',
            '4. Data Retention',
            '5. Your Rights',
            '6. Data Security',
            '7. Third Parties',
            '8. Changes to This Policy',
            '9. Contact Us',
        ].forEach((section) =>
            expect(screen.getByRole('heading', { level: 2, name: section })).toBeInTheDocument()
        );
    });

    it('publishes the company UEN and a contact address', () => {
        render(<PrivacyPolicy />);

        expect(screen.getByText('UEN: 201622535Z')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'progreenbuild@gmail.com' })).toHaveAttribute(
            'href',
            'mailto:progreenbuild@gmail.com'
        );
    });
});

describe('terms page', () => {
    it('lists every numbered clause', () => {
        render(<Terms />);

        expect(screen.getByRole('heading', { level: 1, name: 'Terms and Conditions' })).toBeInTheDocument();
        expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(10);
    });

    it('publishes the company UEN and a contact address', () => {
        render(<Terms />);

        expect(screen.getByText('UEN: 201622535Z')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'progreenbuild@gmail.com' })).toHaveAttribute(
            'href',
            'mailto:progreenbuild@gmail.com'
        );
    });
});

describe('root layout', () => {
    it('exports the site metadata', () => {
        expect(metadata).toEqual({
            title: 'Pro Green Build',
            description: 'Pro Green Build landing page for Singapore home renovation.',
        });
    });
});
