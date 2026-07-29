// Human-readable labels for the enquiry type values stored in the database.
// Shared between the enquiry API route and the admin dashboard.
export const ENQUIRY_TYPE_LABELS = {
    general: 'General Renovation Enquiry',
    bathroom: 'Bathroom Modification',
    kitchen: 'Kitchen Refit',
    'living-room': 'Living Room Renovation',
    'new-home': 'New Home Handover Inspection',
    resale: 'Resale Property Inspection',
    other: 'Other',
};

export function getEnquiryTypeLabel(type) {
    return ENQUIRY_TYPE_LABELS[type] ?? type;
}
