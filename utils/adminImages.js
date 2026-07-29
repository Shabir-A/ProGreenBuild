// Shared image-upload rules for admin server actions.
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Validates an uploaded file field. Returns an error message string, or null when valid.
export function validateImageFile(file) {
    if (!file || typeof file === 'string' || file.size === 0) {
        return 'Choose an image to upload.';
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Only JPG or PNG images are allowed.';
    }
    if (file.size > MAX_IMAGE_BYTES) {
        return 'Image must be 5MB or smaller.';
    }
    return null;
}

export function getImageExtension(file) {
    return file.type === 'image/png' ? 'png' : 'jpg';
}
