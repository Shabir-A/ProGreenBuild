// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/image', () => ({
    default: function NextImage({ src, alt, fill, priority, sizes, ...rest }) {
        return <img src={src} alt={alt} {...rest} />;
    },
}));

const HomeClient = (await import('../app/HomeClient.js')).default;

const defaultProps = {
    galleryItems: [
        { src: '/a.jpg', caption: 'Kitchen refit' },
        { src: '/b.jpg', caption: 'Bathroom' },
    ],
    whatsappNumber: '+65 9123 4567',
    logo: '/logo.png',
    processStages: [
        { label: 'Floor Plan', src: '/stage0.jpg', caption: 'Image for this stage' },
        { label: 'Mid-Renovation', src: '/stage2.jpg', caption: 'Image for this stage' },
    ],
    testimonials: [{ quote: 'Great work', name: 'Ada' }],
    socialMediaLinks: [{ title: 'Instagram', url: 'https://instagram.com/pgb' }],
};

function renderHome(overrides = {}) {
    return render(<HomeClient {...defaultProps} {...overrides} />);
}

async function openEnquiryForm(user) {
    await user.click(screen.getByRole('button', { name: 'Email enquiry' }));
    return screen.getByRole('button', { name: 'Send enquiry' });
}

async function fillEnquiry(user, { name = 'Ada', email = 'ada@example.com', type = 'Kitchen Refit' } = {}) {
    await user.type(screen.getByPlaceholderText('Your name'), name);
    await user.type(screen.getByPlaceholderText('your.email@example.com'), email);
    await user.selectOptions(screen.getByRole('combobox'), type);
}

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('HomeClient content', () => {
    it('renders the uploaded logo when one is set', () => {
        renderHome();

        expect(screen.getByAltText('ProGreenBuild Logo')).toHaveAttribute('src', '/logo.png');
        expect(screen.queryByText('PGB')).not.toBeInTheDocument();
    });

    it('falls back to the PGB wordmark without a logo', () => {
        renderHome({ logo: '' });

        expect(screen.getByText('PGB')).toBeInTheDocument();
        expect(screen.queryByAltText('ProGreenBuild Logo')).not.toBeInTheDocument();
    });

    it('shows years in business counted from August 2016', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-18T00:00:00Z'));
        try {
            renderHome();
            expect(screen.getByText('10+ Years in Business')).toBeInTheDocument();
        } finally {
            vi.useRealTimers();
        }
    });

    it('counts the anniversary year only once it has passed', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-16T00:00:00Z'));
        try {
            renderHome();
            expect(screen.getByText('9+ Years in Business')).toBeInTheDocument();
        } finally {
            vi.useRealTimers();
        }
    });

    it('repeats gallery items three times for the seamless marquee', () => {
        renderHome();

        expect(screen.getAllByAltText('Kitchen refit')).toHaveLength(3);
        expect(screen.queryByText('Gallery photos coming soon.')).not.toBeInTheDocument();
    });

    it('shows a placeholder when there are no gallery items', () => {
        renderHome({ galleryItems: [] });

        expect(screen.getByText('Gallery photos coming soon.')).toBeInTheDocument();
    });

    it('renders the first testimonial from the database', () => {
        renderHome();

        expect(screen.getByText('“Great work”')).toBeInTheDocument();
        expect(screen.getByText('Ada')).toBeInTheDocument();
    });

    it('shows "Coming soon." when no testimonials are approved', () => {
        renderHome({ testimonials: [] });

        expect(screen.getByText('Coming soon.')).toBeInTheDocument();
    });

    it('shows "Coming soon" when no social links are configured', () => {
        renderHome({ socialMediaLinks: [] });

        expect(screen.getByText('Coming soon')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Instagram' })).not.toBeInTheDocument();
    });

    it('links social media entries out to their url', () => {
        renderHome();

        const link = screen.getByRole('link', { name: 'Instagram' });
        expect(link).toHaveAttribute('href', 'https://instagram.com/pgb');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('builds the WhatsApp link from the digits of the configured number', () => {
        renderHome();

        expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
            'href',
            expect.stringContaining('https://wa.me/6591234567?text=')
        );
    });

    it('hides the WhatsApp link when no number is configured', () => {
        renderHome({ whatsappNumber: '  ' });

        expect(screen.queryByRole('link', { name: /whatsapp/i })).not.toBeInTheDocument();
    });
});

describe('HomeClient process carousel', () => {
    it('starts on the first stage', () => {
        renderHome();

        expect(screen.getByText('Stage 1 of 2')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Show process stage 1' })).toHaveAttribute(
            'aria-pressed',
            'true'
        );
    });

    it('jumps to the stage whose dot is clicked', async () => {
        const user = userEvent.setup();
        renderHome();

        await user.click(screen.getByRole('button', { name: 'Show process stage 2' }));

        expect(screen.getByText('Stage 2 of 2')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Show process stage 2' })).toHaveAttribute(
            'aria-pressed',
            'true'
        );
    });

    it('overrides the caption for known stage names', () => {
        renderHome();

        expect(screen.getByText('Initial space planning and room flow.')).toBeInTheDocument();
    });
});

describe('HomeClient enquiry form', () => {
    it('is hidden until the enquiry button is clicked', async () => {
        const user = userEvent.setup();
        renderHome();

        expect(screen.queryByRole('heading', { name: 'Send us an enquiry' })).not.toBeInTheDocument();
        await openEnquiryForm(user);
        expect(screen.getByRole('heading', { name: 'Send us an enquiry' })).toBeInTheDocument();
    });

    it('validates the required fields before calling the API', async () => {
        const user = userEvent.setup();
        renderHome();
        const submit = await openEnquiryForm(user);

        // Submitted directly because the browser's own `required` checks would
        // otherwise stop the event before the handler's guard runs.
        fireEvent.submit(submit.closest('form'));

        expect(
            await screen.findByText('Please fill in your name, email, and enquiry type.')
        ).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('posts the entered fields to the enquiry API', async () => {
        const user = userEvent.setup();
        renderHome();
        const submit = await openEnquiryForm(user);

        await fillEnquiry(user);
        await user.type(screen.getByPlaceholderText(/tell us more/i), 'Two bathrooms');
        await user.click(submit);

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        const [url, options] = fetch.mock.calls[0];
        expect(url).toBe('/api/enquiry');
        expect(options.method).toBe('POST');
        expect(JSON.parse(options.body)).toEqual({
            name: 'Ada',
            email: 'ada@example.com',
            enquiryType: 'kitchen',
            message: 'Two bathrooms',
        });
    });

    it('surfaces the API error and keeps the form open', async () => {
        fetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Too many requests.' }) });
        const user = userEvent.setup();
        renderHome();
        const submit = await openEnquiryForm(user);

        await fillEnquiry(user);
        await user.click(submit);

        expect(await screen.findByText('Too many requests.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeEnabled();
    });

    it('falls back to a generic message when the API sends no error text', async () => {
        fetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });
        const user = userEvent.setup();
        renderHome();
        const submit = await openEnquiryForm(user);

        await fillEnquiry(user);
        await user.click(submit);

        expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });

    it('reports connection failures', async () => {
        fetch.mockRejectedValue(new Error('offline'));
        const user = userEvent.setup();
        renderHome();
        const submit = await openEnquiryForm(user);

        await fillEnquiry(user);
        await user.click(submit);

        expect(
            await screen.findByText('Something went wrong. Please check your connection and try again.')
        ).toBeInTheDocument();
    });

    it('shows a success toast and closes the form after a successful send', async () => {
        const user = userEvent.setup();
        renderHome();
        const submit = await openEnquiryForm(user);

        await fillEnquiry(user);
        await user.click(submit);

        expect(
            await screen.findByText(/we've received your enquiry/i, {}, { timeout: 3000 })
        ).toBeInTheDocument();
        await waitFor(
            () =>
                expect(
                    screen.queryByRole('heading', { name: 'Send us an enquiry' })
                ).not.toBeInTheDocument(),
            { timeout: 3000 }
        );
    });

    it('clears the entered values when the form is dismissed', async () => {
        const user = userEvent.setup();
        renderHome();
        await openEnquiryForm(user);

        await fillEnquiry(user);
        await user.click(screen.getByRole('button', { name: '✕' }));
        await openEnquiryForm(user);

        expect(screen.getByPlaceholderText('Your name')).toHaveValue('');
        expect(screen.getByPlaceholderText('your.email@example.com')).toHaveValue('');
        expect(screen.getByRole('combobox')).toHaveValue('');
    });

    it('offers every enquiry type the API understands', async () => {
        const user = userEvent.setup();
        renderHome();
        await openEnquiryForm(user);

        const options = within(screen.getByRole('combobox')).getAllByRole('option');
        expect(options.map((option) => option.value)).toEqual([
            '',
            'general',
            'bathroom',
            'kitchen',
            'living-room',
            'new-home',
            'resale',
            'other',
        ]);
    });
});
