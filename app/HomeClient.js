'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// Process stages captions (hardcoded, but images come from database)
const STAGE_CAPTIONS = {
    'Floor Plan': 'Initial space planning and room flow.',
    'Floor Plan with Annotations': 'Measurements, notes, and execution marks.',
    'Mid-Renovation': 'Construction in progress.',
    'Finished Result': 'Final handover-ready finish.',
};

const services = [
    ['Home Renovation', 'Full-home transformations with clean coordination from demo to finish.'],
    ['BTO Inspection', 'Detailed checks to catch defects early and protect your handover.'],
    ['Post-Renovation Detailing & Cleanup', 'Final detailing so the home is ready to live in, not just look done.'],
    ['Space Planning', 'Practical layouts that make rooms feel open, usable, and balanced.'],
    ['Custom Carpentry', 'Built-in storage and feature pieces shaped around the way you live.'],
    ['Kitchen & Bathroom Refits', 'Focused refreshes for the rooms that see the most daily use.'],
];

const WHATSAPP_MESSAGE = [
    'Hello! I came across the ProGreenBuild website. I would love to find out more!',
    '',
    'Enquiry type: HDB/ private/ landed/ office/ others (specify)',
    'Message: ',
].join('\n');

const TESTIMONIAL_DURATION = 5600;
const PROCESS_DURATION = 4600;

export default function HomeClient({ galleryItems, whatsappNumber, logo, processStages, testimonials: dbTestimonials, socialMediaLinks }) {
    const [processIndex, setProcessIndex] = useState(0);
    const [processTick, setProcessTick] = useState(0);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [testimonialTick, setTestimonialTick] = useState(0);
    const [showEnquiryForm, setShowEnquiryForm] = useState(false);
    const [formPhase, setFormPhase] = useState('idle'); // 'idle' | 'sending'
    const [enquiryFields, setEnquiryFields] = useState({ name: '', email: '', enquiryType: '', message: '' });
    const [submitError, setSubmitError] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const marqueeRef = useRef(null);
    const marqueeSetWidthRef = useRef(0);
    const marqueePausedRef = useRef(false);
    const [marqueeRepeats, setMarqueeRepeats] = useState(1);

    const hasGalleryItems = galleryItems.length > 0;
    const contactDigits = (whatsappNumber || '').replace(/[^\d]/g, '');
    const hasContactNumber = contactDigits.length > 0;

    const getYearsInBusiness = () => {
        const founded = new Date(2016, 7, 17); // August 17, 2016
        const today = new Date();
        const yearsDiff = today.getFullYear() - founded.getFullYear();
        const monthDayDiff = (today.getMonth() - founded.getMonth()) * 32 + (today.getDate() - founded.getDate());
        return monthDayDiff >= 0 ? yearsDiff : yearsDiff - 1;
    };
    const stagesWithCaptions = processStages.map((stage) => ({
        ...stage,
        caption: STAGE_CAPTIONS[stage.label] || stage.caption,
    }));
    const testimonials = (dbTestimonials || []).map((t) => [t.quote, t.name]);

    // A single set of photos must be at least as wide as the strip, otherwise the
    // three-set track cannot scroll far enough to reach its wrap point.
    useEffect(() => {
        const el = marqueeRef.current;
        if (!el || !hasGalleryItems) return undefined;

        const fitRepeats = () => {
            const setWidth = el.scrollWidth / 3;
            if (setWidth <= 0) return;
            const itemsWidth = setWidth / marqueeRepeats;
            const needed = Math.max(1, Math.ceil(el.clientWidth / itemsWidth));
            if (needed !== marqueeRepeats) setMarqueeRepeats(needed);
        };
        fitRepeats();

        window.addEventListener('resize', fitRepeats);
        return () => window.removeEventListener('resize', fitRepeats);
    }, [hasGalleryItems, marqueeRepeats, galleryItems.length]);

    useEffect(() => {
        const el = marqueeRef.current;
        if (!el || !hasGalleryItems) return undefined;

        // The animation drives a float offset of its own: reading scrollLeft back
        // each frame loses sub-pixel steps, which stalls the marquee entirely.
        let offset = 0;

        const measure = () => {
            marqueeSetWidthRef.current = el.scrollWidth / 3;
            offset = marqueeSetWidthRef.current;
            el.scrollLeft = offset;
        };
        measure();

        const handleResize = () => measure();
        window.addEventListener('resize', handleResize);

        const SPEED_PX_PER_MS = 0.035;
        let lastTime = null;
        let frameId = window.requestAnimationFrame(step);

        function step(time) {
            if (lastTime === null) lastTime = time;
            const delta = Math.min(time - lastTime, 100);
            lastTime = time;

            const setWidth = marqueeSetWidthRef.current;
            if (!marqueePausedRef.current && setWidth > 0) {
                offset += SPEED_PX_PER_MS * delta;
                if (offset > setWidth * 2) offset -= setWidth;
                el.scrollLeft = offset;
            }
            frameId = window.requestAnimationFrame(step);
        }

        const handleScroll = () => {
            const setWidth = marqueeSetWidthRef.current;
            if (!setWidth) return;
            // Only adopt positions the user scrolled to, not our own writes.
            if (Math.abs(el.scrollLeft - offset) > 2) offset = el.scrollLeft;
            if (offset < setWidth * 0.5) {
                offset += setWidth;
                el.scrollLeft = offset;
            } else if (offset > setWidth * 1.5) {
                offset -= setWidth;
                el.scrollLeft = offset;
            }
        };
        el.addEventListener('scroll', handleScroll, { passive: true });

        // Touch devices drag the strip natively; a mouse needs to be wired up.
        let dragStartX = null;
        let dragStartScroll = 0;

        const handlePointerDown = (event) => {
            if (event.pointerType !== 'mouse') return;
            dragStartX = event.clientX;
            dragStartScroll = el.scrollLeft;
            el.setPointerCapture(event.pointerId);
        };

        const handlePointerMove = (event) => {
            if (dragStartX === null) return;
            event.preventDefault();
            offset = dragStartScroll - (event.clientX - dragStartX);
            el.scrollLeft = offset;
        };

        const endDrag = () => {
            dragStartX = null;
        };

        el.addEventListener('pointerdown', handlePointerDown);
        el.addEventListener('pointermove', handlePointerMove);
        el.addEventListener('pointerup', endDrag);
        el.addEventListener('pointercancel', endDrag);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            el.removeEventListener('scroll', handleScroll);
            el.removeEventListener('pointerdown', handlePointerDown);
            el.removeEventListener('pointermove', handlePointerMove);
            el.removeEventListener('pointerup', endDrag);
            el.removeEventListener('pointercancel', endDrag);
        };
    }, [hasGalleryItems, marqueeRepeats]);

    const pauseMarquee = () => {
        marqueePausedRef.current = true;
    };
    const resumeMarquee = () => {
        marqueePausedRef.current = false;
    };

    // A pointer released outside the strip would otherwise pause the marquee forever.
    useEffect(() => {
        window.addEventListener('pointerup', resumeMarquee);
        window.addEventListener('touchend', resumeMarquee);
        return () => {
            window.removeEventListener('pointerup', resumeMarquee);
            window.removeEventListener('touchend', resumeMarquee);
        };
    }, []);

    useEffect(() => {
        if (stagesWithCaptions.length === 0) return undefined;
        const timer = window.setTimeout(() => {
            setProcessIndex((value) => (value + 1) % stagesWithCaptions.length);
            setProcessTick((value) => value + 1);
        }, PROCESS_DURATION);
        return () => window.clearTimeout(timer);
    }, [processTick, stagesWithCaptions.length]);

    useEffect(() => {
        if (testimonials.length === 0) return undefined;
        const timer = window.setTimeout(() => {
            setTestimonialIndex((value) => (value + 1) % testimonials.length);
            setTestimonialTick((value) => value + 1);
        }, TESTIMONIAL_DURATION);
        return () => window.clearTimeout(timer);
    }, [testimonialTick]);

    const activeProcess = processStages[processIndex];
    const activeTestimonial = testimonials[testimonialIndex];

    const closeEnquiryForm = () => {
        setShowEnquiryForm(false);
        setFormPhase('idle');
        setSubmitError('');
        setEnquiryFields({ name: '', email: '', enquiryType: '', message: '' });
    };

    const showSuccessToast = () => {
        setShowSuccessMessage(true);
        window.setTimeout(() => setShowSuccessMessage(false), 4000);
    };

    const handleEnquiryFieldChange = (field) => (event) => {
        setEnquiryFields((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSendEnquiry = async (event) => {
        event.preventDefault();

        if (!enquiryFields.name || !enquiryFields.email || !enquiryFields.enquiryType) {
            setSubmitError('Please fill in your name, email, and enquiry type.');
            return;
        }

        setSubmitError('');
        setFormPhase('sending');

        try {
            const response = await fetch('/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enquiryFields),
            });
            const data = await response.json();

            if (!response.ok) {
                setSubmitError(data.error || 'Something went wrong. Please try again.');
                setFormPhase('idle');
                return;
            }

            closeEnquiryForm();
            showSuccessToast();
        } catch {
            setSubmitError('Something went wrong. Please check your connection and try again.');
            setFormPhase('idle');
        }
    };

    return (
        <main className="overflow-hidden text-[#2f241b]">
            {/* HERO */}
            <section className="hero-surface relative isolate overflow-hidden border-b border-[#143D2E]/15">
                <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 pb-10 pt-5 sm:px-6 sm:pb-14 sm:pt-7 lg:px-8 lg:pb-20">
                    <header className="flex items-center justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            {logo ? (
                                <div className="relative h-16 w-16 overflow-hidden border border-[#143D2E]/25 bg-white sm:h-20 sm:w-20">
                                    <Image
                                        src={logo}
                                        alt="ProGreenBuild Logo"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 64px, 80px"
                                        priority
                                    />
                                </div>
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center bg-[#143D2E] sm:h-20 sm:w-20">
                                    <span className="text-base font-bold tracking-[0.08em] text-white sm:text-xl">PGB</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                                onClick={() => setShowEnquiryForm(true)}
                                className="site-button site-button--chip site-button--primary px-2.5 py-1.5 text-[0.7rem] sm:px-4 sm:py-2.5 sm:text-sm"
                            >
                                Email enquiry
                            </button>
                            {hasContactNumber && (
                                <a
                                    href={`https://wa.me/${contactDigits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="site-button site-button--chip site-button--primary inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[0.7rem] sm:px-4 sm:py-2.5 sm:text-sm"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.868-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                        <path d="M12.001 2.003c-5.522 0-9.998 4.476-9.998 9.997 0 1.762.464 3.484 1.345 4.997l-1.44 4.97 5.099-1.335a9.965 9.965 0 004.994 1.337h.001c5.521 0 9.997-4.476 9.997-9.997 0-5.522-4.476-9.997-9.998-9.997zm0 18.312a8.29 8.29 0 01-4.234-1.156l-.303-.181-3.024.792.808-2.946-.198-.303a8.284 8.284 0 01-1.279-4.421c0-4.581 3.729-8.309 8.311-8.309 4.583 0 8.311 3.728 8.311 8.309-.001 4.582-3.729 8.309-8.312 8.215z" />
                                    </svg>
                                    WhatsApp
                                </a>
                            )}
                        </div>
                    </header>

                    <div className="grid gap-10 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)] lg:items-end lg:gap-16">
                        <div className="max-w-3xl">
                            <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#24426B]">
                                ProGreenBuild Pte. Ltd. · Singapore
                            </p>

                            <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-[#143D2E] sm:text-6xl lg:text-[4.5rem]">
                                Renovation work,<br />done properly.
                            </h1>

                            <p className="mt-5 max-w-xl text-base leading-7 text-[#34443b] sm:text-lg sm:leading-8">
                                Home renovation, BTO inspections, carpentry and finishing work. Practical planning, clear communication and careful delivery from start to handover.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <button onClick={() => setShowEnquiryForm(true)} className="site-button site-button--primary px-5 py-3 text-sm">Discuss your project</button>
                                <a href="#services" className="site-button site-button--soft px-5 py-3 text-sm">Explore our services</a>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="w-full">
                            <div className="border-l-4 border-[#24426B] bg-white p-5 lg:p-7">
                                <div className="flex items-center gap-3 mb-4 lg:mb-5">
                                    <div className="flex h-12 w-12 items-center justify-center border border-[#143D2E]/20 bg-white p-2 lg:h-14 lg:w-14">
                                        <div className="relative h-8 w-8 lg:h-10 lg:w-10">
                                            <Image
                                                src="/images/hdb-logo.png"
                                                alt="HDB Logo"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center border border-[#24426B]/20 bg-white p-2 lg:h-14 lg:w-14">
                                        <div className="relative h-8 w-8 lg:h-10 lg:w-10">
                                            <Image
                                                src="/images/bca-logo.jpg"
                                                alt="BCA Logo"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#143D2E] lg:mb-4">Licensed & Established</p>
                                <div className="space-y-3 lg:space-y-4">
                                    {[
                                        { title: 'HDB Licensed', detail: 'HB-05-6344F' },
                                        { title: 'BCA Registered', detail: 'GB2 Class 2 · CW01 (C3) · FM03 (L1)' },
                                        { title: `${getYearsInBusiness()}+ Years in Business`, detail: 'Founded 2016' },
                                    ].map((item) => (
                                        <div key={item.title} className="flex items-start gap-2.5">
                                            <svg className="h-5 w-5 shrink-0 mt-0.5 lg:h-6 lg:w-6 text-[#24426B]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-semibold text-[#143D2E] lg:text-base">{item.title}</p>
                                                <p className="text-[0.7rem] text-[#2f241b]/80 mt-0.5 lg:text-xs">{item.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* OUR PROCESS */}
            <section className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 sm:pt-14 sm:pb-14 lg:px-8">
                <div className="mb-4 flex items-end justify-between gap-6 sm:mb-6">
                    <div>
                        <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#143D2E] sm:text-4xl sm:tracking-[-0.05em] lg:text-4xl">Our Process</h2>
                        <p className="mt-1.5 text-sm font-semibold tracking-[-0.02em] text-[#2c2118]/75 sm:mt-2 sm:text-base sm:tracking-[-0.03em]">
                            From plan to handover, seen step by step.
                        </p>
                        <div className="mt-3 h-0.5 w-20 bg-[#143D2E] sm:mt-4" />
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-3xl overflow-hidden border border-[#143D2E]/20 bg-white">
                    <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9]">
                        {stagesWithCaptions.map((stage, index) => (
                            <div
                                key={stage.label}
                                className={`absolute inset-0 transition-opacity duration-1000 ${index === processIndex ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <Image
                                    src={stage.src}
                                    alt={stage.label}
                                    fill
                                    priority={index === 0}
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 768px"
                                />
                            </div>
                        ))}

                        {/* Stage label */}
                        <div className="absolute left-2.5 top-2.5 z-10 bg-[#143D2E] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-xs">
                            Stage {processIndex + 1} of {stagesWithCaptions.length}
                        </div>

                        {/* Dots overlay bottom-right of image — reduced prominence on mobile */}
                        <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 sm:bottom-4 sm:right-4 sm:gap-2">
                            {stagesWithCaptions.map((stage, index) => (
                                <button
                                    key={stage.label}
                                    type="button"
                                    onClick={() => {
                                        setProcessIndex(index);
                                        setProcessTick((value) => value + 1);
                                    }}
                                    className={`site-button site-button--dot ${index === processIndex ? 'site-button--selected' : 'site-button--soft'}`}
                                    aria-label={`Show process stage ${index + 1}: ${stage.label}`}
                                    aria-pressed={index === processIndex}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Straightforward stage description below the project image. */}
                    <div className="border-t border-[#143D2E]/15 px-4 py-4 sm:px-6 sm:py-5">
                        <div>
                            <p className="text-[0.55rem] uppercase tracking-[0.22em] font-medium text-[#143D2E]/65 sm:text-[0.7rem] sm:tracking-[0.36em]">{stagesWithCaptions[processIndex]?.label}</p>
                            <p className="mt-1.5 text-[0.75rem] leading-5 text-[#2c2118] sm:mt-2.5 sm:text-base sm:leading-6 font-medium">{stagesWithCaptions[processIndex]?.caption}</p>
                            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#143D2E]/10 sm:mt-4 sm:h-1.5">
                                <div
                                    key={processTick}
                                    className="process-progress h-full bg-[#24426B]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* GALLERY */}
            <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-14 lg:px-8">
                <div className="mb-4 flex items-end justify-between gap-6 sm:mb-6">
                    <div>
                        <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#143D2E] sm:text-4xl sm:tracking-[-0.05em] lg:text-4xl">Gallery</h2>
                        <p className="mt-1.5 text-sm font-semibold tracking-[-0.02em] text-[#2c2118]/75 sm:mt-2 sm:text-base sm:tracking-[-0.03em]">
                            A seamless view of the finished spaces.
                        </p>
                        <div className="mt-3 h-0.5 w-20 bg-[#143D2E] sm:mt-4" />
                    </div>
                </div>

                {hasGalleryItems ? (
                    <div
                        ref={marqueeRef}
                        className="marquee-strip border border-[#143D2E]/20 bg-white"
                        onTouchStart={pauseMarquee}
                        onTouchEnd={resumeMarquee}
                        onTouchCancel={resumeMarquee}
                        onPointerDown={pauseMarquee}
                        onPointerUp={resumeMarquee}
                        onPointerCancel={resumeMarquee}
                    >
                        <div className="marquee-track py-2 sm:py-4">
                            {Array.from({ length: marqueeRepeats * 3 }, () => galleryItems).flat().map((item, index) => (
                                <article
                                    key={`${item.caption}-${index}`}
                                    className="group relative h-32 w-44 shrink-0 overflow-hidden bg-[#e6e9e4] sm:h-56 sm:w-[18.5rem] lg:h-60 lg:w-[20.5rem]"
                                >
                                    <Image
                                        src={item.src}
                                        alt={item.caption}
                                        fill
                                        className="object-cover transition duration-700 group-hover:scale-[1.04]"
                                        sizes="(max-width: 640px) 13rem, (max-width: 1024px) 18.5rem, 20.5rem"
                                    />
                                    <div className="absolute inset-x-2 bottom-2 bg-[#143D2E] px-2 py-1 text-white sm:inset-x-3 sm:bottom-3 sm:px-3 sm:py-2">
                                        <p className="mt-0.5 text-[0.65rem] font-medium sm:mt-1 sm:text-sm">{item.caption}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="border border-[#143D2E]/20 bg-white p-8 text-center text-sm text-[#5d4a3b]">
                        Gallery photos coming soon.
                    </div>
                )}
            </section>

            {/* SERVICES */}
            <section id="services" className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-14 lg:px-8">
                <div className="max-w-2xl mb-8 sm:mb-12">
                    <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#143D2E] sm:text-4xl sm:tracking-[-0.05em] lg:text-4xl">Services</h2>
                    <p className="mt-1.5 text-sm font-semibold tracking-[-0.02em] text-[#2c2118]/75 sm:mt-2 sm:text-base sm:tracking-[-0.03em]">
                        Everything you need for a smooth renovation, and more.
                    </p>
                    <div className="mt-3 h-0.5 w-20 bg-[#24426B] sm:mt-4" />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-10 lg:gap-12">
                    {services.map(([title, description], index) => {
                        const accent = index % 2 === 0 ? '#143D2E' : '#24426B';
                        return (
                        <div key={title} className="group">
                            <div className="flex items-baseline gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <p className="text-2xl sm:text-3xl font-light tracking-tight" style={{ color: accent }}>{String(index + 1).padStart(2, '0')}</p>
                                <div className="flex-1 h-1 transition-opacity duration-300 opacity-70 group-hover:opacity-85" style={{ backgroundColor: accent }} />
                            </div>
                            <h3 className="text-sm sm:text-lg font-semibold text-[#2c2118] tracking-[-0.01em] mt-2 sm:mt-3 mb-1 sm:mb-2">
                                {title}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#6f5843] leading-5 sm:leading-6 font-light">
                                {description}
                            </p>
                        </div>
                        );
                    })}
                </div>
            </section>

            {/* TESTIMONIALS & ABOUT */}
            <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-14 lg:px-8">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 items-stretch">
                    {/* LEFT: TESTIMONIALS */}
                    <div className="border border-[#143D2E]/20 bg-white p-4 sm:p-8">
                        <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#143D2E] sm:text-2xl sm:tracking-[-0.05em]">Testimonials</h2>
                        <p className="mt-1.5 text-sm font-semibold tracking-[-0.02em] text-[#2c2118]/75 sm:mt-2 sm:text-base sm:tracking-[-0.03em]">
                            What homeowners say about working with us.
                        </p>
                        <div className="mt-3 h-0.5 w-16 bg-[#143D2E] sm:mt-4" />

                        {testimonials.length === 0 ? (
                            <p className="mt-6 text-sm text-gray-600">Coming soon.</p>
                        ) : (
                            <div className="mt-4 sm:mt-6">
                                <div className="border-l-2 border-[#24426B] bg-[#f4f6f3] p-4 sm:p-6">
                                    <p className="text-sm leading-[1.3] tracking-[-0.02em] text-[#2c2118] sm:text-lg sm:leading-[1.4] sm:tracking-[-0.03em]">
                                        &ldquo;{activeTestimonial[0]}&rdquo;
                                    </p>
                                    <p className="mt-2 text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-[#143D2E] sm:mt-3 sm:text-[0.65rem] sm:tracking-[0.2em]">
                                        {activeTestimonial[1]}
                                    </p>
                                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/40 sm:mt-4 sm:h-1.5">
                                        <div
                                            key={testimonialTick}
                                            className="testimonial-progress h-full bg-[#24426B]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: ABOUT */}
                    <div className="border border-[#143D2E]/20 bg-white p-4 sm:p-8">
                        <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#143D2E] sm:text-2xl sm:tracking-[-0.05em]">About</h2>
                        <p className="mt-1.5 text-sm font-semibold tracking-[-0.02em] text-[#2c2118]/75 sm:mt-2 sm:text-base sm:tracking-[-0.03em]">
                            {getYearsInBusiness()} years in business, focused on clear pricing and careful delivery.
                        </p>
                        <div className="mt-3 h-0.5 w-16 bg-[#24426B] sm:mt-4" />
                        <p className="mt-4 text-xs leading-5 text-[#5d4a3b] sm:mt-6 sm:text-sm sm:leading-6">
                            ProGreenBuild has been helping Singapore homeowners transform their spaces since 2016 through quality workmanship, transparent pricing, and reliable project delivery.
                        </p>
                    </div>
                </div>
            </section>

            {/* CONTACT / FOOTER */}
            <footer id="contact" className="mx-auto max-w-7xl px-3 pb-6 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
                <div className="border border-[#143D2E]/20 bg-white p-4 sm:p-8">
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <div>
                            <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#143D2E] sm:text-4xl sm:tracking-[-0.05em] lg:text-4xl">Contact</h2>
                            <p className="mt-1.5 text-sm font-semibold tracking-[-0.02em] text-[#2c2118]/75 sm:mt-2 sm:text-base sm:tracking-[-0.03em]">
                                Ready when you are.
                            </p>
                            <div className="mt-3 h-0.5 w-20 bg-[#143D2E] sm:mt-4" />
                        </div>

                        {/* Contact options and social media - side by side */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            {/* Left: Social Media */}
                            <div className="flex flex-col gap-2">
                                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#143D2E] sm:text-xs">Follow us</p>
                                {socialMediaLinks.length === 0 ? (
                                    <p className="text-sm text-gray-600">Coming soon</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2 text-[0.7rem] sm:gap-3 sm:text-sm">
                                        {socialMediaLinks.map((link) => (
                                            <a
                                                key={link.title}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="site-button site-button--chip px-2.5 py-1 sm:px-4 sm:py-2"
                                            >
                                                {link.title}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Contact Options */}
                            <div className="flex flex-col gap-2">
                                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#143D2E] sm:text-xs">Get in touch</p>
                                <div className="flex flex-wrap gap-2 text-[0.7rem] font-medium sm:gap-3 sm:text-sm">
                                    <button
                                        onClick={() => setShowEnquiryForm(true)}
                                        className="site-button site-button--chip px-2.5 py-1.5 sm:px-5 sm:py-3"
                                    >
                                        Email enquiry
                                    </button>
                                    {hasContactNumber && (
                                        <a
                                            href={`https://wa.me/${contactDigits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="site-button site-button--chip inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-5 sm:py-3"
                                        >
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.868-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                                <path d="M12.001 2.003c-5.522 0-9.998 4.476-9.998 9.997 0 1.762.464 3.484 1.345 4.997l-1.44 4.97 5.099-1.335a9.965 9.965 0 004.994 1.337h.001c5.521 0 9.997-4.476 9.997-9.997 0-5.522-4.476-9.997-9.998-9.997zm0 18.312a8.29 8.29 0 01-4.234-1.156l-.303-.181-3.024.792.808-2.946-.198-.303a8.284 8.284 0 01-1.279-4.421c0-4.581 3.729-8.309 8.311-8.309 4.583 0 8.311 3.728 8.311 8.309-.001 4.582-3.729 8.309-8.312 8.215z" />
                                            </svg>
                                            WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ENQUIRY FORM MODAL */}
            {showEnquiryForm && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 sm:items-center">
                    <div className="relative w-full max-w-md border border-[#143D2E]/20 bg-white p-5 shadow-xl sm:p-8">
                        <button
                            onClick={closeEnquiryForm}
                            type="button"
                            aria-label="Close enquiry form"
                            className="absolute right-3 top-3 text-[#143D2E] hover:text-[#2f241b] sm:right-4 sm:top-4"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-semibold text-[#2d2118] sm:text-2xl">Send us an enquiry</h3>
                        <p className="mt-1 text-xs text-[#6f5843] sm:text-sm">We'll get back to you shortly</p>

                        <form className="mt-4 sm:mt-6" onSubmit={handleSendEnquiry}>
                            <div className="space-y-3 sm:space-y-4">
                                {submitError && (
                                    <p className="rounded-[0.6rem] border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                                        {submitError}
                                    </p>
                                )}

                                {/* Name */}
                                <div>
                                    <label className="text-xs font-semibold text-[#143D2E] sm:text-sm">Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        value={enquiryFields.name}
                                        onChange={handleEnquiryFieldChange('name')}
                                        required
                                        className="mt-1 w-full rounded border border-[#143D2E]/30 bg-white px-3 py-2 text-sm text-[#2f241b] placeholder-[#8d7b6e] focus:border-[#143D2E] focus:outline-none focus:ring-2 focus:ring-[#143D2E]/20 sm:px-4 sm:py-2.5 sm:text-base"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-xs font-semibold text-[#143D2E] sm:text-sm">Email *</label>
                                    <input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={enquiryFields.email}
                                        onChange={handleEnquiryFieldChange('email')}
                                        required
                                        className="mt-1 w-full rounded border border-[#143D2E]/30 bg-white px-3 py-2 text-sm text-[#2f241b] placeholder-[#8d7b6e] focus:border-[#143D2E] focus:outline-none focus:ring-2 focus:ring-[#143D2E]/20 sm:px-4 sm:py-2.5 sm:text-base"
                                    />
                                </div>

                                {/* Enquiry Type */}
                                <div>
                                    <label className="text-xs font-semibold text-[#143D2E] sm:text-sm">Enquiry type *</label>
                                    <select
                                        value={enquiryFields.enquiryType}
                                        onChange={handleEnquiryFieldChange('enquiryType')}
                                        required
                                        className="mt-1 w-full rounded border border-[#143D2E]/30 bg-white px-3 py-2 text-sm text-[#2f241b] focus:border-[#143D2E] focus:outline-none focus:ring-2 focus:ring-[#143D2E]/20 sm:px-4 sm:py-2.5 sm:text-base"
                                    >
                                        <option value="">Select an enquiry type</option>
                                        <option value="general">General Renovation Enquiry</option>
                                        <option value="bathroom">Bathroom Modification</option>
                                        <option value="kitchen">Kitchen Refit</option>
                                        <option value="living-room">Living Room Renovation</option>
                                        <option value="new-home">New Home Handover Inspection</option>
                                        <option value="resale">Resale Property Inspection</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="text-xs font-semibold text-[#143D2E] sm:text-sm">Message</label>
                                    <textarea
                                        placeholder="Tell us more about your project... (optional)"
                                        rows={5}
                                        value={enquiryFields.message}
                                        onChange={handleEnquiryFieldChange('message')}
                                        className="mt-1 w-full rounded border border-[#143D2E]/30 bg-white px-3 py-2 text-sm text-[#2f241b] placeholder-[#8d7b6e] focus:border-[#143D2E] focus:outline-none focus:ring-2 focus:ring-[#143D2E]/20 sm:px-4 sm:py-2.5 sm:text-base"
                                    />
                                </div>
                            </div>

                            <div className="mt-5 sm:mt-6">
                                <button
                                    type="submit"
                                    disabled={formPhase !== 'idle'}
                                    className="site-button site-button--primary w-full px-4 py-3 text-sm"
                                >
                                    {formPhase === 'sending' ? 'Sending enquiry…' : 'Send enquiry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showSuccessMessage && (
                <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="rounded-lg bg-[#143D2E] px-4 py-3 text-white shadow-lg sm:px-6 sm:py-4">
                        <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-medium">Thank you! We've received your enquiry and will be in touch soon.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer - Legal Info */}
            <footer className="border-t border-[#143D2E]/20 bg-[#edf1eb] px-3 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {/* Company Info */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#143D2E]">Company</p>
                            <div className="mt-3 space-y-1 text-xs text-gray-600">
                                <p className="font-medium text-[#143D2E] border-l-3 border-[#143D2E] pl-2">PROGREENBUILD PTE. LTD.</p>
                                <p>UEN: 201622535Z</p>
                                <p>Singapore</p>
                            </div>
                        </div>

                        {/* Legal Links */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#143D2E]">Legal</p>
                            <div className="mt-3 space-y-2">
                                <a href="/privacy" className="text-xs text-gray-600 hover:text-[#143D2E] transition-colors">Privacy Policy</a>
                                <br />
                                <a href="/terms" className="text-xs text-gray-600 hover:text-[#143D2E] transition-colors">Terms & Conditions</a>
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#143D2E]">Contact</p>
                            <div className="mt-3 text-xs text-gray-600">
                                <p>
                                    <a href="mailto:progreenbuild@gmail.com" className="hover:text-gray-900">
                                        progreenbuild@gmail.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
                        <p>&copy; {new Date().getFullYear()} PROGREENBUILD PTE. LTD. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
