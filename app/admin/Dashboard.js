'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
    addGalleryImage,
    addSocialMediaLink,
    addTestimonial,
    deleteEnquiry,
    deleteGalleryImage,
    deleteSocialMediaLink,
    deleteTestimonial,
    logout,
    updateEnquiryStatus,
    updateLogo,
    updateProcessStage,
    updateWhatsappNumber,
} from './actions';
import { ENQUIRY_TYPE_LABELS } from '../../utils/enquiries';

const initialUploadState = { error: null, success: false };
const initialNumberState = { error: null, success: false };
const initialLogoState = { error: null, success: false };
const initialStageState = { error: null, success: false };
const initialSocialMediaState = { error: null, success: false };

const ENQUIRY_STATUS_OPTIONS = [
    { value: 'pending_reply', label: 'Pending Reply from Pro Green Build' },
    { value: 'awaiting_customer', label: 'Awaiting Customer Response' },
    { value: 'converted', label: 'Converted to Client' },
    { value: 'closed', label: 'Closed - Not Converted' },
];

export default function Dashboard({ galleryItems, whatsappNumber, logo, processStages, enquiries, testimonials, socialMediaLinks }) {
    const [uploadFormKey, setUploadFormKey] = useState(0);
    const [uploadState, uploadAction, uploadPending] = useActionState(addGalleryImage, initialUploadState);
    const [numberState, numberAction, numberPending] = useActionState(updateWhatsappNumber, initialNumberState);
    const [logoState, logoAction, logoPending] = useActionState(updateLogo, initialLogoState);
    const [testimonialFormKey, setTestimonialFormKey] = useState(0);
    const [testimonialState, testimonialAction, testimonialPending] = useActionState(addTestimonial, initialUploadState);
    const [socialMediaFormKey, setSocialMediaFormKey] = useState(0);
    const [socialMediaState, socialMediaAction, socialMediaPending] = useActionState(addSocialMediaLink, initialSocialMediaState);
    const [stageStates, setStageStates] = useState({});
    const [deletingId, setDeletingId] = useState(null);
    const [deletingTestimonialId, setDeletingTestimonialId] = useState(null);
    const [deletingSocialMediaId, setDeletingSocialMediaId] = useState(null);
    const [enquiryStatusPendingId, setEnquiryStatusPendingId] = useState(null);
    const [deletingEnquiryId, setDeletingEnquiryId] = useState(null);
    const [enquiryErrors, setEnquiryErrors] = useState({});
    const [fileSelected, setFileSelected] = useState(false);
    const [uploadSubmitted, setUploadSubmitted] = useState(false);
    const [logoFileSelected, setLogoFileSelected] = useState(false);
    const [stageFileSelected, setStageFileSelected] = useState({});
    const [showUploadSuccess, setShowUploadSuccess] = useState(false);
    const [showLogoSuccess, setShowLogoSuccess] = useState(false);
    const [showTestimonialSuccess, setShowTestimonialSuccess] = useState(false);
    const [showSocialMediaSuccess, setShowSocialMediaSuccess] = useState(false);
    const [showNumberSuccess, setShowNumberSuccess] = useState(false);
    const fileInputRef = useRef(null);
    const logoInputRef = useRef(null);
    const stageInputRefs = useRef({});
    const inactivityTimerRef = useRef(null);

    // Auto-logout after 15 minutes of inactivity
    useEffect(() => {
        const INACTIVITY_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

        const resetInactivityTimer = () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = setTimeout(() => {
                logout();
            }, INACTIVITY_TIME);
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetInactivityTimer));

        resetInactivityTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (uploadState?.success) {
            setUploadFormKey((key) => key + 1);
            setFileSelected(false);
            setUploadSubmitted(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setShowUploadSuccess(true);
            const timer = setTimeout(() => setShowUploadSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [uploadState]);

    useEffect(() => {
        if (logoState?.success) {
            setLogoFileSelected(false);
            if (logoInputRef.current) {
                logoInputRef.current.value = '';
            }
            setShowLogoSuccess(true);
            const timer = setTimeout(() => setShowLogoSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [logoState]);

    useEffect(() => {
        if (testimonialState?.success) {
            setTestimonialFormKey((key) => key + 1);
            setShowTestimonialSuccess(true);
            const timer = setTimeout(() => setShowTestimonialSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [testimonialState]);

    useEffect(() => {
        if (socialMediaState?.success) {
            setSocialMediaFormKey((key) => key + 1);
            setShowSocialMediaSuccess(true);
            const timer = setTimeout(() => setShowSocialMediaSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [socialMediaState]);

    useEffect(() => {
        if (numberState?.success) {
            setShowNumberSuccess(true);
            const timer = setTimeout(() => setShowNumberSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [numberState]);

    const handleDelete = async (id, storagePath) => {
        if (!window.confirm('Remove this image?')) return;
        setDeletingId(id);
        await deleteGalleryImage(id, storagePath);
        setDeletingId(null);
    };

    const handleEnquiryStatusChange = async (id, status) => {
        setEnquiryStatusPendingId(id);
        const result = await updateEnquiryStatus(id, status);
        setEnquiryErrors((prev) => ({ ...prev, [id]: result?.error ?? null }));
        setEnquiryStatusPendingId(null);
    };

    const handleDeleteEnquiry = async (id) => {
        if (!window.confirm('Delete this enquiry? This cannot be undone.')) return;
        setDeletingEnquiryId(id);
        const result = await deleteEnquiry(id);
        setEnquiryErrors((prev) => ({ ...prev, [id]: result?.error ?? null }));
        setDeletingEnquiryId(null);
    };

    const handleDeleteTestimonial = async (id) => {
        if (!window.confirm('Delete this testimonial?')) return;
        setDeletingTestimonialId(id);
        await deleteTestimonial(id);
        setDeletingTestimonialId(null);
    };

    const handleDeleteSocialMediaLink = async (id) => {
        if (!window.confirm('Delete this social media link?')) return;
        setDeletingSocialMediaId(id);
        await deleteSocialMediaLink(id);
        setDeletingSocialMediaId(null);
    };

    const handleFileChange = (e) => {
        setFileSelected(e.target.files && e.target.files.length > 0);
    };

    const handleLogoFileChange = (e) => {
        setLogoFileSelected(e.target.files && e.target.files.length > 0);
    };

    const handleStageFileChange = (stageId) => (e) => {
        setStageFileSelected((prev) => ({
            ...prev,
            [stageId]: e.target.files && e.target.files.length > 0,
        }));
    };

    const handleUploadSubmit = async (formData) => {
        setUploadSubmitted(true);
        await uploadAction(formData);
    };

    const handleStageSubmit = (stageId) => async (formData) => {
        const action = updateProcessStage;
        const state = await action(stageStates[stageId] || initialStageState, formData);
        setStageStates((prev) => ({
            ...prev,
            [stageId]: state,
        }));
        if (state?.success && stageInputRefs.current[stageId]) {
            stageInputRefs.current[stageId].value = '';
            setStageFileSelected((prev) => ({
                ...prev,
                [stageId]: false,
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 font-sans text-black">
            <div className="mx-auto max-w-3xl">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-5 mb-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <form action={logout}>
                            <button type="submit" className="bg-gray-200 border border-gray-400 px-3 py-2 text-sm font-mono hover:bg-gray-300 cursor-pointer rounded text-sm px-6">
                                Log out
                            </button>
                        </form>
                    </div>
                </div>

                {/* ENQUIRIES SECTION - AT TOP */}
                <section className="mb-10 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-5 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Enquiries</h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Manage incoming enquiries</p>
                    </div>

                    {enquiries.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4">No enquiries yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {enquiries.map((item) => (
                                <li key={item.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50 hover:bg-white transition">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.email}</p>
                                        </div>
                                        <p className="whitespace-nowrap text-xs text-gray-400">
                                            {new Date(item.created_at).toLocaleDateString('en-SG', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <p className="mb-2 text-xs text-gray-600">
                                        <span className="font-medium">Type:</span> {ENQUIRY_TYPE_LABELS[item.enquiry_type] ?? item.enquiry_type}
                                    </p>
                                    {item.message && (
                                        <p className="mb-3 text-xs text-gray-700 bg-white p-2 rounded border border-gray-100 whitespace-pre-wrap">{item.message}</p>
                                    )}

                                    {enquiryErrors[item.id] && (
                                        <p className="mb-2 text-xs text-red-600 bg-red-50 p-2 rounded">{enquiryErrors[item.id]}</p>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <select
                                            value={item.status}
                                            disabled={enquiryStatusPendingId === item.id}
                                            onChange={(e) => handleEnquiryStatusChange(item.id, e.target.value)}
                                            className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400"
                                        >
                                            {ENQUIRY_STATUS_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteEnquiry(item.id)}
                                            disabled={deletingEnquiryId === item.id}
                                            className="bg-red-200 border border-red-400 px-3 py-2 text-sm font-mono hover:bg-red-300 cursor-pointer rounded text-red-900"
                                        >
                                            {deletingEnquiryId === item.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* LOGO SECTION */}
                <section className="mb-10 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-5 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Logo</h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Update your site logo</p>
                    </div>
                    <form action={logoAction} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-900 block mb-2">
                                Logo image (JPG or PNG, max 5MB) *
                            </label>
                            <div className="win95-file-input-wrapper">
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    name="logo"
                                    accept="image/jpeg,image/png"
                                    onChange={handleLogoFileChange}
                                    id="logo-input"
                                />
                                <label htmlFor="logo-input" className="bg-gray-200 border border-gray-400 px-3 py-2 text-sm font-mono hover:bg-gray-300 cursor-pointer rounded">
                                    Choose File
                                </label>
                                <span className="win95-file-text text-xs text-gray-500">{logoFileSelected ? 'File selected' : ''}</span>
                            </div>
                        </div>
                        {logo && (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-medium text-gray-700 mb-2">Current logo:</p>
                                <div className="relative h-16 w-16">
                                    <Image src={logo} alt="Logo" fill className="object-contain" sizes="64px" />
                                </div>
                            </div>
                        )}
                        {logoState?.error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{logoState.error}</p>}
                        {showLogoSuccess && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">Logo updated.</p>}
                        <button
                            type="submit"
                            disabled={logoPending}
                            className="bg-gray-200 border border-gray-400 px-3 py-2 text-sm font-mono hover:bg-gray-300 cursor-pointer rounded w-full mt-4"
                        >
                            {logoPending ? 'Uploading...' : 'Update logo'}
                        </button>
                    </form>
                </section>

                {/* PROCESS STAGES SECTION */}
                <section className="mb-10 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-5 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Process Stages</h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Update renovation process images</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {processStages.map((stage) => (
                            <form key={stage.id} action={handleStageSubmit(stage.id)} className="border border-gray-300 p-3">
                                <label className="text-xs font-medium block mb-2">
                                    {stage.stage_name}
                                </label>
                                <div className="win95-file-input-wrapper mb-2">
                                    <input
                                        ref={(el) => {
                                            stageInputRefs.current[stage.id] = el;
                                        }}
                                        type="file"
                                        name="image"
                                        accept="image/jpeg,image/png"
                                        onChange={handleStageFileChange(stage.id)}
                                        id={`stage-input-${stage.id}`}
                                    />
                                    <label htmlFor={`stage-input-${stage.id}`} className="bg-gray-200 border border-gray-400 px-3 py-2 text-sm font-mono hover:bg-gray-300 cursor-pointer rounded text-xs">
                                        File
                                    </label>
                                </div>
                                {stage.image_url && (
                                    <div className="mb-2">
                                        <div className="relative h-16 w-full bg-gray-100">
                                            <Image src={stage.image_url} alt={stage.stage_name} fill className="object-cover" sizes="200px" />
                                        </div>
                                    </div>
                                )}
                                {!stage.image_url && (
                                    <div className="mb-2 h-16 w-full border border-dashed border-gray-300 flex items-center justify-center">
                                        <p className="text-[10px] text-gray-500">No image</p>
                                    </div>
                                )}
                                <input type="hidden" name="stage_id" value={stage.id} />
                                {stageStates[stage.id]?.error && <p className="mb-2 text-xs text-red-700">{stageStates[stage.id].error}</p>}
                                {stageStates[stage.id]?.success && <p className="mb-2 text-xs text-green-700">✓</p>}
                                <button
                                    type="submit"
                                    className="bg-gray-200 border border-gray-400 px-3 py-2 text-sm font-mono hover:bg-gray-300 cursor-pointer rounded w-full text-xs"
                                >
                                    Update
                                </button>
                            </form>
                        ))}
                    </div>
                </section>

                {/* GALLERY SECTION */}
                <section className="mb-10 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-5 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Gallery Images</h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Manage renovation photos</p>
                    </div>

                    <form key={uploadFormKey} action={handleUploadSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <label className="text-sm font-medium text-gray-900 block mb-1">
                                Image (JPG or PNG, max 5MB) *
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                name="image"
                                accept="image/jpeg,image/png"
                                required
                                onChange={handleFileChange}
                                className="block w-full text-sm border border-gray-300 rounded px-2 py-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-900 block mb-1">
                                Caption *
                            </label>
                            <input
                                type="text"
                                name="caption"
                                required
                                placeholder="e.g. Living Room"
                                className="block w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                            />
                        </div>

                        {uploadState?.error && uploadSubmitted && fileSelected && (
                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{uploadState.error}</p>
                        )}
                        {showUploadSuccess && (
                            <p className="text-sm text-green-600 bg-green-50 p-2 rounded">Image added.</p>
                        )}

                        <button
                            type="submit"
                            disabled={uploadPending}
                            className="bg-gray-200 border border-gray-400 px-3 py-2 text-sm font-mono hover:bg-gray-300 cursor-pointer rounded w-full"
                        >
                            {uploadPending ? 'Uploading...' : 'Add image'}
                        </button>
                    </form>

                    {galleryItems.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4">No images yet.</p>
                    ) : (
                        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {galleryItems.map((item) => (
                                <li key={item.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition">
                                    <div className="relative h-24 w-full bg-gray-100">
                                        <Image
                                            src={item.image_url}
                                            alt={item.caption || 'Gallery image'}
                                            fill
                                            className="object-cover"
                                            sizes="200px"
                                        />
                                    </div>
                                    <div className="p-2">
                                        <p className="truncate text-xs text-gray-700 font-medium">{item.caption}</p>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item.id, item.storage_path)}
                                            disabled={deletingId === item.id}
                                            className="bg-red-200 border border-red-400 px-3 py-2 text-sm font-medium hover:bg-red-300 cursor-pointer rounded mt-2 w-full text-red-900"
                                        >
                                            {deletingId === item.id ? 'Removing...' : 'Remove'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* TESTIMONIALS SECTION */}
                <section className="mb-10 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-5 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Testimonials</h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Add client testimonials</p>
                    </div>

                    <form key={testimonialFormKey} action={testimonialAction} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <label className="text-sm font-medium text-gray-900 block mb-1">
                                Client Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. Jane Tan"
                                className="block w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-900 block mb-1">
                                Testimonial Quote *
                            </label>
                            <textarea
                                name="quote"
                                required
                                placeholder="What did the client say?"
                                rows={3}
                                maxLength={500}
                                className="block w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                            />
                            <p className="mt-1 text-xs text-gray-500">Max 500 characters</p>
                        </div>

                        {testimonialState?.error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{testimonialState.error}</p>}
                        {showTestimonialSuccess && <p className="text-sm text-green-600 bg-green-50 p-2 rounded">Testimonial added.</p>}

                        <button
                            type="submit"
                            disabled={testimonialPending}
                            className="bg-gray-200 border border-gray-400 px-3 py-2 text-sm font-mono hover:bg-gray-300 cursor-pointer rounded w-full"
                        >
                            {testimonialPending ? 'Adding...' : 'Add testimonial'}
                        </button>
                    </form>

                    {testimonials.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4">No testimonials yet. Add your first one above.</p>
                    ) : (
                        <div className="space-y-3">
                            {testimonials.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition">
                                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                    <p className="mt-2 text-sm text-gray-700 italic">"{item.quote}"</p>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteTestimonial(item.id)}
                                        disabled={deletingTestimonialId === item.id}
                                        className="bg-red-200 border border-red-400 px-3 py-2 text-sm font-medium hover:bg-red-300 cursor-pointer rounded mt-3 text-red-900"
                                    >
                                        {deletingTestimonialId === item.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* SOCIAL MEDIA LINKS SECTION */}
                <section className="mb-10 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-5 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Social Media Links</h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Add social media platforms</p>
                    </div>

                    <form key={socialMediaFormKey} action={socialMediaAction} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <label className="text-sm font-medium text-gray-900 block mb-1">
                                Platform name *
                            </label>
                            <input
                                type="text"
                                name="title"
                                required
                                placeholder="e.g. Facebook, LinkedIn, Instagram"
                                className="block w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-900 block mb-1">
                                URL *
                            </label>
                            <input
                                type="url"
                                name="url"
                                required
                                placeholder="https://facebook.com/yourpage"
                                className="block w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                            />
                        </div>

                        {socialMediaState?.error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{socialMediaState.error}</p>}
                        {showSocialMediaSuccess && <p className="text-sm text-green-600 bg-green-50 p-2 rounded">Social media link added.</p>}

                        <button
                            type="submit"
                            disabled={socialMediaPending}
                            className="bg-gray-200 border border-gray-400 px-3 py-2 text-sm font-mono hover:bg-gray-300 cursor-pointer rounded w-full"
                        >
                            {socialMediaPending ? 'Adding...' : 'Add link'}
                        </button>
                    </form>

                    {socialMediaLinks.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4">No social media links yet. Add your first one above.</p>
                    ) : (
                        <div className="space-y-3">
                            {socialMediaLinks.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition">
                                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                                    <p className="mt-2 text-xs text-gray-600 truncate hover:text-clip">{item.url}</p>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteSocialMediaLink(item.id)}
                                        disabled={deletingSocialMediaId === item.id}
                                        className="bg-red-200 border border-red-400 px-3 py-2 text-sm font-medium hover:bg-red-300 cursor-pointer rounded mt-3 text-red-900"
                                    >
                                        {deletingSocialMediaId === item.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* WHATSAPP / PHONE NUMBER SECTION */}
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-5 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Contact Number</h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">WhatsApp & phone number</p>
                    </div>
                    <form action={numberAction} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-900 block mb-1">
                                Number with country code, digits only (e.g 6591118111)
                            </label>
                            <input
                                type="text"
                                name="whatsapp_number"
                                defaultValue={whatsappNumber}
                                placeholder="6591118111"
                                className="block w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                            />
                        </div>
                        {numberState?.error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{numberState.error}</p>}
                        {showNumberSuccess && <p className="text-sm text-green-600 bg-green-50 p-2 rounded">Saved.</p>}
                        <button
                            type="submit"
                            disabled={numberPending}
                            className="bg-gray-200 border border-gray-400 px-3 py-2 text-sm font-mono hover:bg-gray-300 cursor-pointer rounded w-full mt-2"
                        >
                            {numberPending ? 'Saving...' : 'Save number'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
