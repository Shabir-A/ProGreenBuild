'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { addGalleryImage, deleteGalleryImage, logout, updateWhatsappNumber, updateLogo, updateProcessStage } from './actions';

const initialUploadState = { error: null, success: false };
const initialNumberState = { error: null, success: false };
const initialLogoState = { error: null, success: false };
const initialStageState = { error: null, success: false };

export default function Dashboard({ galleryItems, whatsappNumber, logo, processStages }) {
    const [uploadFormKey, setUploadFormKey] = useState(0);
    const [uploadState, uploadAction, uploadPending] = useActionState(addGalleryImage, initialUploadState);
    const [numberState, numberAction, numberPending] = useActionState(updateWhatsappNumber, initialNumberState);
    const [logoState, logoAction, logoPending] = useActionState(updateLogo, initialLogoState);
    const [stageStates, setStageStates] = useState({});
    const [deletingId, setDeletingId] = useState(null);
    const [fileSelected, setFileSelected] = useState(false);
    const [uploadSubmitted, setUploadSubmitted] = useState(false);
    const [logoFileSelected, setLogoFileSelected] = useState(false);
    const [stageFileSelected, setStageFileSelected] = useState({});
    const fileInputRef = useRef(null);
    const logoInputRef = useRef(null);
    const stageInputRefs = useRef({});

    useEffect(() => {
        if (uploadState?.success) {
            setUploadFormKey((key) => key + 1);
            setFileSelected(false);
            setUploadSubmitted(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [uploadState]);

    useEffect(() => {
        if (logoState?.success) {
            setLogoFileSelected(false);
            if (logoInputRef.current) {
                logoInputRef.current.value = '';
            }
        }
    }, [logoState]);

    const handleDelete = async (id, storagePath) => {
        if (!window.confirm('Remove this image?')) return;
        setDeletingId(id);
        await deleteGalleryImage(id, storagePath);
        setDeletingId(null);
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
        <div className="min-h-screen bg-white px-4 py-10 font-sans text-black">
            <div className="mx-auto max-w-2xl">
                <div className="flex items-center justify-between border-b border-gray-300 pb-4 mb-8">
                    <h1 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Admin</h1>
                    <form action={logout}>
                        <button type="submit" className="win95-button text-sm">
                            Log out
                        </button>
                    </form>
                </div>

                {/* LOGO SECTION */}
                <section className="mb-12">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-4">Logo</h2>
                    <form action={logoAction} className="border border-gray-300 p-4">
                        <label className="text-sm font-medium block mb-2">
                            Logo image (JPG or PNG, max 5MB) *
                        </label>
                        <div className="win95-file-input-wrapper mb-4">
                            <input
                                ref={logoInputRef}
                                type="file"
                                name="logo"
                                accept="image/jpeg,image/png"
                                onChange={handleLogoFileChange}
                                id="logo-input"
                            />
                            <label htmlFor="logo-input" className="win95-button">
                                Choose File
                            </label>
                            <span className="win95-file-text">{logoFileSelected ? 'File selected' : ''}</span>
                        </div>
                        {logo && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-600 mb-2">Current logo:</p>
                                <div className="relative h-16 w-16">
                                    <Image src={logo} alt="Logo" fill className="object-contain" sizes="64px" />
                                </div>
                            </div>
                        )}
                        {logoState?.error && <p className="mb-4 text-sm text-red-700">{logoState.error}</p>}
                        {logoState?.success && <p className="mb-4 text-sm text-green-700">Logo updated.</p>}
                        <button
                            type="submit"
                            disabled={logoPending}
                            className="win95-button w-full"
                        >
                            {logoPending ? 'Uploading...' : 'Update logo'}
                        </button>
                    </form>
                </section>

                {/* PROCESS STAGES SECTION - 2x2 GRID */}
                <section className="mb-12">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-4">Process stages</h2>
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
                                    <label htmlFor={`stage-input-${stage.id}`} className="win95-button text-xs">
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
                                    className="win95-button w-full text-xs"
                                >
                                    Update
                                </button>
                            </form>
                        ))}
                    </div>
                </section>

                {/* GALLERY SECTION */}
                <section className="mb-12">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-4">Gallery images</h2>

                    <form key={uploadFormKey} action={handleUploadSubmit} className="border border-gray-300 p-4 mb-4">
                        <div className="mb-4">
                            <label className="text-sm font-medium">
                                Image (JPG or PNG, max 5MB) *
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                name="image"
                                accept="image/jpeg,image/png"
                                required
                                onChange={handleFileChange}
                                className="mt-2 block w-full text-sm"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-sm font-medium">
                                Caption *
                            </label>
                            <input
                                type="text"
                                name="caption"
                                required
                                placeholder="e.g. Living Room"
                                className="mt-2 block w-full border border-gray-300 px-2 py-1 text-sm"
                            />
                        </div>

                        {uploadState?.error && uploadSubmitted && fileSelected && (
                            <p className="mb-4 text-sm text-red-700">{uploadState.error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={uploadPending}
                            className="win95-button w-full"
                        >
                            {uploadPending ? 'Uploading...' : 'Add image'}
                        </button>
                    </form>

                    {galleryItems.length === 0 ? (
                        <p className="text-sm text-gray-500">No images yet.</p>
                    ) : (
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {galleryItems.map((item) => (
                                <li key={item.id} className="border border-gray-300 p-2">
                                    <div className="relative h-24 w-full bg-gray-100">
                                        <Image
                                            src={item.image_url}
                                            alt={item.caption || 'Gallery image'}
                                            fill
                                            className="object-cover"
                                            sizes="200px"
                                        />
                                    </div>
                                    <p className="mt-1 truncate text-xs text-gray-700 font-medium">{item.caption}</p>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item.id, item.storage_path)}
                                        disabled={deletingId === item.id}
                                        className="win95-button mt-1 w-full text-xs"
                                    >
                                        {deletingId === item.id ? 'Removing...' : 'Remove'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* PHONE NUMBER SECTION */}
                <section>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-4">WhatsApp / phone number</h2>
                    <form action={numberAction} className="border border-gray-300 p-4">
                        <label className="text-sm font-medium">
                            Number with country code, digits only (e.g 6591118111)
                        </label>
                        <input
                            type="text"
                            name="whatsapp_number"
                            defaultValue={whatsappNumber}
                            placeholder="6591118111"
                            className="mt-2 mb-4 block w-full border border-gray-300 px-2 py-1 text-sm"
                        />
                        {numberState?.error && <p className="mb-4 text-sm text-red-700">{numberState.error}</p>}
                        {numberState?.success && <p className="mb-4 text-sm text-green-700">Saved.</p>}
                        <button
                            type="submit"
                            disabled={numberPending}
                            className="win95-button w-full"
                        >
                            {numberPending ? 'Saving...' : 'Save number'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
