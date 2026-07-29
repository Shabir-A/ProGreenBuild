// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const actions = {
    addGalleryImage: vi.fn(),
    addSocialMediaLink: vi.fn(),
    addTestimonial: vi.fn(),
    deleteEnquiry: vi.fn(),
    deleteGalleryImage: vi.fn(),
    deleteSocialMediaLink: vi.fn(),
    deleteTestimonial: vi.fn(),
    logout: vi.fn(),
    updateEnquiryStatus: vi.fn(),
    updateLogo: vi.fn(),
    updateProcessStage: vi.fn(),
    updateWhatsappNumber: vi.fn(),
};

vi.mock('../../app/admin/actions', () => ({
    addGalleryImage: (...args) => actions.addGalleryImage(...args),
    addSocialMediaLink: (...args) => actions.addSocialMediaLink(...args),
    addTestimonial: (...args) => actions.addTestimonial(...args),
    deleteEnquiry: (...args) => actions.deleteEnquiry(...args),
    deleteGalleryImage: (...args) => actions.deleteGalleryImage(...args),
    deleteSocialMediaLink: (...args) => actions.deleteSocialMediaLink(...args),
    deleteTestimonial: (...args) => actions.deleteTestimonial(...args),
    logout: (...args) => actions.logout(...args),
    updateEnquiryStatus: (...args) => actions.updateEnquiryStatus(...args),
    updateLogo: (...args) => actions.updateLogo(...args),
    updateProcessStage: (...args) => actions.updateProcessStage(...args),
    updateWhatsappNumber: (...args) => actions.updateWhatsappNumber(...args),
}));

vi.mock('next/image', () => ({
    default: function NextImage({ src, alt, fill, sizes, ...rest }) {
        return <img src={src} alt={alt} {...rest} />;
    },
}));

const Dashboard = (await import('../../app/admin/Dashboard.js')).default;

const defaultProps = {
    galleryItems: [{ id: 1, image_url: '/a.jpg', storage_path: 'user-1/a.jpg', caption: 'Kitchen' }],
    whatsappNumber: '6591234567',
    logo: '/logo.png',
    processStages: [{ id: 0, stage_name: 'Floor Plan', image_url: null }],
    enquiries: [
        {
            id: 10,
            name: 'Ada',
            email: 'ada@example.com',
            enquiry_type: 'kitchen',
            message: 'Two bathrooms',
            status: 'pending_reply',
            created_at: '2026-01-15T00:00:00Z',
        },
    ],
    testimonials: [{ id: 20, quote: 'Great work', name: 'Ada', created_at: '2026-01-15T00:00:00Z' }],
    socialMediaLinks: [{ id: 30, title: 'Instagram', url: 'https://instagram.com/pgb' }],
};

function renderDashboard(overrides = {}) {
    return render(<Dashboard {...defaultProps} {...overrides} />);
}

/** Returns the enquiry list item that contains the given text. */
function enquiryCard(text) {
    return screen.getByText(text).closest('li');
}

/** Returns the card element that contains the given text. */
function cardContaining(text) {
    return screen.getByText(text).closest('div');
}

/** The file inputs have no associated label, so they are looked up by name within their form. */
function fileInput(buttonName, name = 'image') {
    return screen.getByRole('button', { name: buttonName }).closest('form').querySelector(`input[name="${name}"]`);
}

// jsdom's FormData cannot read a File back out of a file input (the name and size
// are dropped), so file assertions check the input itself plus the field name.
function expectFileField(formData, field) {
    expect(formData.has(field)).toBe(true);
}

// The gallery file input is `required`, and jsdom does not treat a
// programmatically attached file as satisfying that constraint, so the form is
// submitted directly instead of by clicking the button.
function submitGalleryForm() {
    fireEvent.submit(screen.getByRole('button', { name: 'Add image' }).closest('form'));
}

beforeEach(() => {
    Object.values(actions).forEach((action) => action.mockReset().mockResolvedValue({ success: true }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Dashboard sections', () => {
    it('renders each management section', () => {
        renderDashboard();

        ['Enquiries', 'Logo', 'Process Stages', 'Gallery Images', 'Testimonials', 'Social Media Links', 'Contact Number']
            .forEach((heading) => expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument());
    });

    it('shows empty states when there is no content', () => {
        renderDashboard({ galleryItems: [], enquiries: [], testimonials: [], socialMediaLinks: [] });

        expect(screen.getByText('No enquiries yet.')).toBeInTheDocument();
        expect(screen.getByText('No images yet.')).toBeInTheDocument();
        expect(screen.getByText('No testimonials yet. Add your first one above.')).toBeInTheDocument();
        expect(screen.getByText('No social media links yet. Add your first one above.')).toBeInTheDocument();
    });

    it('prefills the saved contact number', () => {
        renderDashboard();

        expect(screen.getByPlaceholderText('6591118111')).toHaveValue('6591234567');
    });

    it('shows a placeholder for process stages without an image', () => {
        renderDashboard();

        expect(screen.getByText('No image')).toBeInTheDocument();
    });
});

describe('Dashboard enquiries', () => {
    it('renders the enquiry with a human readable type', () => {
        renderDashboard();

        expect(screen.getByText('ada@example.com')).toBeInTheDocument();
        expect(screen.getByText('Kitchen Refit')).toBeInTheDocument();
        expect(screen.getByText('Two bathrooms')).toBeInTheDocument();
    });

    it('falls back to the raw type when it has no label', () => {
        renderDashboard({
            enquiries: [{ ...defaultProps.enquiries[0], enquiry_type: 'loft-conversion' }],
        });

        expect(screen.getByText('loft-conversion')).toBeInTheDocument();
    });

    it('updates the status through the server action', async () => {
        const user = userEvent.setup();
        renderDashboard();

        await user.selectOptions(screen.getByRole('combobox'), 'converted');

        await waitFor(() => expect(actions.updateEnquiryStatus).toHaveBeenCalledWith(10, 'converted'));
    });

    it('shows an error returned by the status update', async () => {
        actions.updateEnquiryStatus.mockResolvedValue({ error: 'Could not update status. Please try again.' });
        const user = userEvent.setup();
        renderDashboard();

        await user.selectOptions(screen.getByRole('combobox'), 'closed');

        expect(await screen.findByText('Could not update status. Please try again.')).toBeInTheDocument();
    });

    it('deletes an enquiry after confirmation', async () => {
        const user = userEvent.setup();
        renderDashboard();

        await user.click(within(enquiryCard('ada@example.com')).getByRole('button', { name: 'Delete' }));

        expect(window.confirm).toHaveBeenCalledWith('Delete this enquiry? This cannot be undone.');
        await waitFor(() => expect(actions.deleteEnquiry).toHaveBeenCalledWith(10));
    });

    it('keeps the enquiry when the confirmation is dismissed', async () => {
        window.confirm.mockReturnValue(false);
        const user = userEvent.setup();
        renderDashboard();

        await user.click(within(enquiryCard('ada@example.com')).getByRole('button', { name: 'Delete' }));

        expect(actions.deleteEnquiry).not.toHaveBeenCalled();
    });
});

describe('Dashboard gallery', () => {
    it('submits the upload form to addGalleryImage', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const input = fileInput('Add image');
        await user.upload(input, new File(['x'], 'photo.png', { type: 'image/png' }));
        expect(input.files[0].name).toBe('photo.png');
        await user.type(screen.getByPlaceholderText('e.g. Living Room'), 'Living Room');
        submitGalleryForm();

        await waitFor(() => expect(actions.addGalleryImage).toHaveBeenCalledTimes(1));
        const formData = actions.addGalleryImage.mock.calls[0][1];
        expect(formData.get('caption')).toBe('Living Room');
        expectFileField(formData, 'image');
    });

    it('confirms a success message after an upload', async () => {
        const user = userEvent.setup();
        renderDashboard();

        await user.upload(fileInput('Add image'), new File(['x'], 'photo.png', { type: 'image/png' }));
        await user.type(screen.getByPlaceholderText('e.g. Living Room'), 'Living Room');
        submitGalleryForm();

        expect(await screen.findByText('Image added.')).toBeInTheDocument();
    });

    it('surfaces an upload error', async () => {
        actions.addGalleryImage.mockResolvedValue({ error: 'Only JPG or PNG images are allowed.' });
        const user = userEvent.setup();
        renderDashboard();

        await user.upload(fileInput('Add image'), new File(['x'], 'photo.png', { type: 'image/png' }));
        await user.type(screen.getByPlaceholderText('e.g. Living Room'), 'Living Room');
        submitGalleryForm();

        expect(await screen.findByText('Only JPG or PNG images are allowed.')).toBeInTheDocument();
    });

    it('removes an image after confirmation', async () => {
        const user = userEvent.setup();
        renderDashboard();

        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(window.confirm).toHaveBeenCalledWith('Remove this image?');
        await waitFor(() => expect(actions.deleteGalleryImage).toHaveBeenCalledWith(1, 'user-1/a.jpg'));
    });
});

describe('Dashboard testimonials and social links', () => {
    it('adds a testimonial', async () => {
        const user = userEvent.setup();
        renderDashboard();

        await user.type(screen.getByPlaceholderText('e.g. Jane Tan'), 'Jane Tan');
        await user.type(screen.getByPlaceholderText('What did the client say?'), 'Lovely finish');
        await user.click(screen.getByRole('button', { name: 'Add testimonial' }));

        await waitFor(() => expect(actions.addTestimonial).toHaveBeenCalledTimes(1));
        const formData = actions.addTestimonial.mock.calls[0][1];
        expect(formData.get('name')).toBe('Jane Tan');
        expect(formData.get('quote')).toBe('Lovely finish');
        expect(await screen.findByText('Testimonial added.')).toBeInTheDocument();
    });

    it('caps the testimonial quote at 500 characters in the UI', () => {
        renderDashboard();

        expect(screen.getByPlaceholderText('What did the client say?')).toHaveAttribute('maxlength', '500');
    });

    it('deletes a testimonial after confirmation', async () => {
        const user = userEvent.setup();
        renderDashboard();

        await user.click(within(cardContaining('"Great work"')).getByRole('button', { name: 'Delete' }));

        expect(window.confirm).toHaveBeenCalledWith('Delete this testimonial?');
        await waitFor(() => expect(actions.deleteTestimonial).toHaveBeenCalledWith(20));
    });

    it('adds a social media link', async () => {
        const user = userEvent.setup();
        renderDashboard();

        await user.type(screen.getByPlaceholderText(/e.g. Facebook/), 'Facebook');
        await user.type(screen.getByPlaceholderText('https://facebook.com/yourpage'), 'https://facebook.com/pgb');
        await user.click(screen.getByRole('button', { name: 'Add link' }));

        await waitFor(() => expect(actions.addSocialMediaLink).toHaveBeenCalledTimes(1));
        const formData = actions.addSocialMediaLink.mock.calls[0][1];
        expect(formData.get('title')).toBe('Facebook');
        expect(formData.get('url')).toBe('https://facebook.com/pgb');
    });

    it('deletes a social media link after confirmation', async () => {
        const user = userEvent.setup();
        renderDashboard();

        await user.click(within(cardContaining('https://instagram.com/pgb')).getByRole('button', { name: 'Delete' }));

        expect(window.confirm).toHaveBeenCalledWith('Delete this social media link?');
        await waitFor(() => expect(actions.deleteSocialMediaLink).toHaveBeenCalledWith(30));
    });
});

describe('Dashboard settings forms', () => {
    it('saves the contact number', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const input = screen.getByPlaceholderText('6591118111');
        await user.clear(input);
        await user.type(input, '6598765432');
        await user.click(screen.getByRole('button', { name: 'Save number' }));

        await waitFor(() => expect(actions.updateWhatsappNumber).toHaveBeenCalledTimes(1));
        expect(actions.updateWhatsappNumber.mock.calls[0][1].get('whatsapp_number')).toBe('6598765432');
        expect(await screen.findByText('Saved.')).toBeInTheDocument();
    });

    it('uploads a new logo', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const input = document.getElementById('logo-input');
        await user.upload(input, new File(['x'], 'logo.png', { type: 'image/png' }));

        expect(screen.getByText('File selected')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Update logo' }));

        await waitFor(() => expect(actions.updateLogo).toHaveBeenCalledTimes(1));
        expectFileField(actions.updateLogo.mock.calls[0][1], 'logo');
        expect(await screen.findByText('Logo updated.')).toBeInTheDocument();
        // The success handler clears the input so the same file is not re-uploaded.
        expect(input.files).toHaveLength(0);
    });

    it('surfaces a logo upload error', async () => {
        actions.updateLogo.mockResolvedValue({ error: 'Image must be 5MB or smaller.' });
        const user = userEvent.setup();
        renderDashboard();

        await user.click(screen.getByRole('button', { name: 'Update logo' }));

        expect(await screen.findByText('Image must be 5MB or smaller.')).toBeInTheDocument();
    });

    it('updates a process stage image and reports success', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const input = document.getElementById('stage-input-0');
        await user.upload(input, new File(['x'], 'stage.png', { type: 'image/png' }));
        await user.click(screen.getByRole('button', { name: 'Update' }));

        await waitFor(() => expect(actions.updateProcessStage).toHaveBeenCalledTimes(1));
        const formData = actions.updateProcessStage.mock.calls[0][1];
        expect(formData.get('stage_id')).toBe('0');
        expectFileField(formData, 'image');
        expect(await screen.findByText('✓')).toBeInTheDocument();
        expect(input.files).toHaveLength(0);
    });

    it('surfaces a process stage error', async () => {
        actions.updateProcessStage.mockResolvedValue({ error: 'Choose an image to upload.' });
        const user = userEvent.setup();
        renderDashboard();

        await user.click(screen.getByRole('button', { name: 'Update' }));

        expect(await screen.findByText('Choose an image to upload.')).toBeInTheDocument();
    });

    it('logs out automatically after 15 minutes of inactivity', () => {
        vi.useFakeTimers();
        try {
            renderDashboard();

            vi.advanceTimersByTime(15 * 60 * 1000 - 1);
            expect(actions.logout).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(actions.logout).toHaveBeenCalledTimes(1);
        } finally {
            vi.useRealTimers();
        }
    });

    it('restarts the inactivity timer on user activity', () => {
        vi.useFakeTimers();
        try {
            renderDashboard();

            vi.advanceTimersByTime(14 * 60 * 1000);
            window.dispatchEvent(new window.Event('keydown'));
            vi.advanceTimersByTime(14 * 60 * 1000);

            expect(actions.logout).not.toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });
});
