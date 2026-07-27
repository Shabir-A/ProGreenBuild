'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const processStages = [
    { label: 'Floor Plan', src: encodeURI('/images/gallery/floor plan.png'), caption: 'Initial space planning and room flow.' },
    { label: 'Floor Plan with Annotations', src: encodeURI('/images/gallery/floor plan drawing.jpg'), caption: 'Measurements, notes, and execution marks.' },
    { label: 'Mid-Renovation', src: encodeURI('/images/gallery/kitchen reno.jpg'), caption: 'Construction in progress.' },
    { label: 'Finished Result', src: encodeURI('/images/gallery/kitchen done.jpg'), caption: 'Final handover-ready finish.' },
];

const galleryItems = [
    { src: encodeURI('/images/gallery/living room.jpg'), caption: 'Living Room' },
    { src: encodeURI('/images/gallery/living room 1.jpg'), caption: 'Living Room Detail' },
    { src: encodeURI('/images/gallery/bathroom.jpg'), caption: 'Bathroom Refresh' },
];

const services = [
    ['Home Renovation', 'Full-home transformations with clean coordination from demo to finish.'],
    ['BTO Inspection', 'Detailed checks to catch defects early and protect your handover.'],
    ['Post-Renovation Detailing & Cleanup', 'Final detailing so the home is ready to live in, not just look done.'],
    ['Space Planning', 'Practical layouts that make rooms feel open, usable, and balanced.'],
    ['Custom Carpentry', 'Built-in storage and feature pieces shaped around the way you live.'],
    ['Kitchen & Bathroom Refits', 'Focused refreshes for the rooms that see the most daily use.'],
];

const testimonials = [
    ['The pricing was clear from the start and the finish still felt premium.', 'Jane Tan (test)'],
    ['They kept the home tidy and the handover was much easier than we expected.', 'Daniel Lim (test)'],
    ['Quick replies, good advice, and the final look was exactly what we wanted.', 'Alicia Wong (test)'],
    ['The team made the renovation feel straightforward instead of stressful.', 'Marcus Goh (test)'],
    ['Strong value for the price, with a finish that looked carefully considered.', 'Priya Nair (test)'],
];

const TESTIMONIAL_DURATION = 5600;
const PROCESS_DURATION = 4600;

export default function Home() {
    const [processIndex, setProcessIndex] = useState(0);
    const [processTick, setProcessTick] = useState(0);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [testimonialTick, setTestimonialTick] = useState(0);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setProcessIndex((value) => (value + 1) % processStages.length);
            setProcessTick((value) => value + 1);
        }, PROCESS_DURATION);
        return () => window.clearTimeout(timer);
    }, [processTick]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setTestimonialIndex((value) => (value + 1) % testimonials.length);
            setTestimonialTick((value) => value + 1);
        }, TESTIMONIAL_DURATION);
        return () => window.clearTimeout(timer);
    }, [testimonialTick]);

    const activeProcess = processStages[processIndex];
    const activeTestimonial = testimonials[testimonialIndex];

    return (
        <main className="overflow-hidden text-[#2f241b]">
            {/* HERO */}
            <section className="relative isolate">
                <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top_left,_rgba(111,132,86,0.5),_rgba(111,132,86,0)_38%),radial-gradient(circle_at_70%_20%,_rgba(111,132,86,0.18),_rgba(111,132,86,0)_24%),radial-gradient(circle_at_85%_10%,_rgba(123,82,50,0.28),_rgba(123,82,50,0)_26%),linear-gradient(180deg,rgba(255,253,248,0.94),rgba(255,253,248,0))]" />
                <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
                    <header className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(111,132,86,0.98),rgba(196,162,106,0.92),rgba(123,82,50,0.92))] shadow-[0_20px_60px_-30px_rgba(83,58,34,0.72)] backdrop-blur-xl sm:h-11 sm:w-11">
                                <span className="text-xs font-semibold tracking-[0.3em] text-[#f7f1e6] sm:text-sm">PGB</span>
                            </div>
                            <div>
                                <p className="text-[0.6rem] uppercase tracking-[0.32em] text-[#6f8456] sm:text-[0.7rem] sm:tracking-[0.38em]">Singapore renovation</p>
                            </div>
                        </div>
                        <a href="#contact" className="glass-button glass-button--chip glass-button--primary px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm">Get in touch</a>
                    </header>

                    <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-20">
                        <div className="max-w-2xl">
                            <span className="glass-button glass-button--chip mb-5 inline-flex text-[10px] uppercase tracking-[0.24em] text-[#6f8456] sm:mb-6 sm:text-xs sm:tracking-[0.36em]">
                                Competitive pricing, done well
                            </span>

                            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#22402a] sm:text-6xl sm:tracking-[-0.06em] lg:text-7xl">
                                Pro Green Build
                            </h1>

                            {/* Headline options:
                  1. Competitive renovation pricing without compromise.
                  2. Better renovation pricing for homes that deserve more.
                  3. Competitive pricing, polished finishes, and a smoother build. */}
                            <p className="mt-4 max-w-xl text-base leading-7 text-[#4f5f49] sm:mt-6 sm:text-xl sm:leading-8">
                                Competitive pricing for Singapore homes, with a smooth process and a polished finish.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
                                <a href="#contact" className="glass-button glass-button--chip glass-button--primary px-4 py-2.5 text-sm font-semibold sm:px-6 sm:py-3">
                                    Get in touch
                                </a>
                                <span className="glass-button glass-button--chip px-4 py-2.5 text-xs text-[#6f8456] sm:px-5 sm:py-3 sm:text-sm">
                                    Warm tones. Clean work. Fair pricing.
                                </span>
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-xl">
                            <div className="absolute -left-6 top-10 hidden h-24 w-24 rounded-full bg-[#d8b77a]/30 blur-3xl lg:block" />
                            <div className="absolute -right-4 bottom-4 hidden h-28 w-28 rounded-full bg-[#6f8456]/18 blur-3xl lg:block" />

                            <div className="rounded-[1.6rem] border border-[#6f8456]/18 bg-[linear-gradient(180deg,rgba(255,252,247,0.72),rgba(226,239,213,0.58),rgba(233,224,205,0.52))] p-2.5 shadow-[0_35px_90px_-45px_rgba(58,42,27,0.88)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-3">
                                <div className="rounded-[1.3rem] border border-[#6f8456]/14 bg-[linear-gradient(180deg,rgba(255,252,247,0.74),rgba(230,240,218,0.86),rgba(244,236,222,0.76))] p-3 sm:rounded-[1.7rem] sm:p-4">
                                    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                                        <div className="rounded-[1.1rem] border border-[#c4a26a]/30 bg-[linear-gradient(180deg,rgba(255,251,244,0.9),rgba(233,225,210,0.92))] p-3.5 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:col-span-2 sm:rounded-[1.4rem] sm:p-4">
                                            <p className="text-[10px] uppercase tracking-[0.28em] text-[#6f8456] sm:text-xs sm:tracking-[0.35em]">Project approach</p>
                                            <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#2f241b] sm:mt-3 sm:text-2xl sm:tracking-[-0.04em]">
                                                Clear communication, seamless execution.
                                            </p>
                                            <div className="mt-3 h-px w-20 bg-[linear-gradient(90deg,#6f8456,#c4a26a,#7b5232)] sm:mt-4 sm:w-24" />
                                        </div>

                                        <div className="rounded-[1.1rem] border border-[#6f8456]/24 bg-[linear-gradient(180deg,rgba(228,239,214,0.92),rgba(235,226,210,0.84))] p-3.5 backdrop-blur-xl sm:rounded-[1.4rem] sm:p-4">
                                            <p className="text-xs text-[#725a45] sm:text-sm">Delivery style</p>
                                            <p className="mt-1.5 text-base font-semibold text-[#5a3f2b] sm:mt-2 sm:text-lg">Polished, purposeful, efficient.</p>
                                        </div>

                                        <div className="rounded-[1.1rem] border border-[#6f8456]/28 bg-[linear-gradient(180deg,rgba(221,233,207,0.94),rgba(240,233,220,0.8))] p-3.5 backdrop-blur-xl sm:rounded-[1.4rem] sm:p-4">
                                            <p className="text-xs text-[#725a45] sm:text-sm">Project feel</p>
                                            <p className="mt-1.5 text-base font-semibold text-[#5a3f2b] sm:mt-2 sm:text-lg">Practical, neat, value-driven.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* OUR PROCESS */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
                <div className="mb-5 flex items-end justify-between gap-6 sm:mb-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6f8456]">Our Process</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#2c2118] sm:mt-3 sm:text-4xl sm:tracking-[-0.05em] lg:text-4xl">
                            From plan to handover, seen step by step.
                        </h2>
                        <div className="mt-3 h-px w-24 bg-[linear-gradient(90deg,#6f8456,#c4a26a,#7b5232)] sm:mt-4 sm:w-28" />
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[1.6rem] border border-[#6f8456]/22 bg-[linear-gradient(180deg,rgba(255,251,244,0.5),rgba(223,236,208,0.52),rgba(231,220,197,0.42))] shadow-[0_30px_100px_-58px_rgba(54,39,23,0.92)] backdrop-blur-2xl sm:rounded-[2.1rem]">
                    <div className="relative aspect-[16/9] min-h-[13rem] overflow-hidden sm:min-h-[24rem] lg:min-h-[24rem]">
                        {processStages.map((stage, index) => (
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
                                    sizes="(max-width: 768px) 100vw, 1200px"
                                />
                            </div>
                        ))}

                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,19,11,0.08)_0%,rgba(27,19,11,0.14)_55%,rgba(27,19,11,0.62)_100%)]" />

                        <div className="absolute left-3 top-3 z-10 glass-button glass-button--chip px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-[#6f8456] sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.34em]">
                            Stage {processIndex + 1} of {processStages.length}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:p-5">
                            <div className="max-w-md rounded-[1.1rem] border border-white/20 bg-white/16 px-3 py-2.5 text-white backdrop-blur-xl sm:rounded-[1.35rem] sm:px-4 sm:py-3">
                                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-white/70 sm:text-[0.7rem] sm:tracking-[0.34em]">{activeProcess.label}</p>
                                <p className="mt-1.5 text-xs leading-5 text-white/90 sm:mt-2 sm:text-base sm:leading-6">{activeProcess.caption}</p>
                            </div>

                            <div className="flex items-center gap-2 self-end">
                                {processStages.map((stage, index) => (
                                    <button
                                        key={stage.label}
                                        type="button"
                                        onClick={() => {
                                            setProcessIndex(index);
                                            setProcessTick((value) => value + 1);
                                        }}
                                        className={`glass-button glass-button--dot ${index === processIndex ? 'glass-button--selected' : 'glass-button--soft'}`}
                                        aria-label={`Show process stage ${index + 1}`}
                                        aria-pressed={index === processIndex}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* GALLERY */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
                <div className="mb-5 flex items-end justify-between gap-6 sm:mb-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6f8456]">Gallery</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#2c2118] sm:mt-3 sm:text-4xl sm:tracking-[-0.05em] lg:text-4xl">
                            A seamless view of the finished spaces.
                        </h2>
                        <div className="mt-3 h-px w-24 bg-[linear-gradient(90deg,#6f8456,#c4a26a,#7b5232)] sm:mt-4 sm:w-28" />
                    </div>
                </div>

                <div className="marquee-strip rounded-[1.6rem] border border-[#6f8456]/20 bg-[linear-gradient(180deg,rgba(245,240,230,0.38),rgba(219,233,206,0.48),rgba(220,205,182,0.3))] shadow-[0_30px_100px_-60px_rgba(54,39,23,0.9)] backdrop-blur-2xl sm:rounded-[2.1rem]">
                    <div className="marquee-track py-3 sm:py-4">
                        {[...galleryItems, ...galleryItems].map((item, index) => (
                            <article
                                key={`${item.caption}-${index}`}
                                className="group relative h-40 w-52 shrink-0 overflow-hidden rounded-[1.1rem] border border-[#6f8456]/18 bg-[linear-gradient(180deg,rgba(255,252,247,0.42),rgba(223,236,208,0.28),rgba(221,209,188,0.26))] shadow-[0_18px_45px_-32px_rgba(58,42,27,0.7)] sm:h-56 sm:w-[18.5rem] sm:rounded-[1.45rem] lg:h-60 lg:w-[20.5rem]"
                            >
                                <Image
                                    src={item.src}
                                    alt={item.caption}
                                    fill
                                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                                    sizes="(max-width: 640px) 13rem, (max-width: 1024px) 18.5rem, 20.5rem"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,21,12,0.02)_40%,rgba(32,21,12,0.5)_100%)]" />
                                <div className="absolute inset-x-2.5 bottom-2.5 rounded-[0.8rem] border border-white/25 bg-[linear-gradient(180deg,rgba(123,82,50,0.54),rgba(111,132,86,0.32))] px-2.5 py-1.5 text-white backdrop-blur-xl sm:inset-x-3 sm:bottom-3 sm:rounded-[1rem] sm:px-3 sm:py-2">
                                    <p className="text-[0.6rem] uppercase tracking-[0.24em] text-white/70 sm:text-[0.7rem] sm:tracking-[0.32em]">Gallery</p>
                                    <div className="mt-1 h-px w-8 bg-[linear-gradient(90deg,#6f8456,#c4a26a,#7b5232)] sm:w-10" />
                                    <p className="mt-1 text-xs font-medium sm:text-sm">{item.caption}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6f8456]">Services</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#2c2118] sm:mt-3 sm:text-4xl sm:tracking-[-0.05em] lg:text-4xl">
                        Everything YOU need for a smooth renovation, and more.
                    </h2>
                    <div className="mt-3 h-px w-24 bg-[linear-gradient(90deg,#6f8456,#c4a26a,#7b5232)] sm:mt-4 sm:w-28" />
                </div>

                <div className="mt-6 grid gap-3.5 sm:mt-8 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {services.map(([title, description]) => (
                        <div
                            key={title}
                            className="rounded-[1.4rem] border border-[#6f8456]/24 bg-[linear-gradient(180deg,rgba(255,251,244,0.8),rgba(228,239,214,0.84),rgba(236,224,206,0.58))] p-4 shadow-[0_22px_70px_-44px_rgba(64,45,24,0.85)] backdrop-blur-xl sm:rounded-[1.8rem] sm:p-5"
                        >
                            <div className="h-px w-10 bg-[linear-gradient(90deg,#6f8456,#c4a26a,#7b5232)] sm:w-12" />
                            <p className="mt-3 text-base font-semibold text-[#2b1f17] sm:mt-4 sm:text-lg">{title}</p>
                            <p className="mt-1.5 text-sm leading-6 text-[#645040] sm:mt-2 sm:leading-7">{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
                {/* PLACEHOLDER TESTIMONIALS - REPLACE BEFORE LAUNCH */}
                <div className="rounded-[1.7rem] border border-[#6f8456]/22 bg-[linear-gradient(180deg,rgba(250,246,238,0.6),rgba(227,237,214,0.7),rgba(236,223,206,0.46))] p-4 shadow-[0_30px_90px_-55px_rgba(54,39,23,0.9)] backdrop-blur-2xl sm:rounded-[2.25rem] sm:p-8 lg:p-10">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6f8456]">Testimonials</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#2c2118] sm:mt-3 sm:text-4xl sm:tracking-[-0.05em] lg:text-4xl">
                                A few words from our clients.
                            </h2>
                            <div className="mt-3 h-px w-24 bg-[linear-gradient(90deg,#6f8456,#c4a26a,#7b5232)] sm:mt-4 sm:w-28" />
                        </div>

                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {testimonials.map(([, name], index) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => {
                                        setTestimonialIndex(index);
                                        setTestimonialTick((value) => value + 1);
                                    }}
                                    className={`glass-button glass-button--chip px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.28em] ${index === testimonialIndex ? 'glass-button--selected text-[#553d22]' : 'glass-button--soft text-[#6f5843]'
                                        }`}
                                    aria-pressed={index === testimonialIndex}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3.5 sm:mt-8 sm:gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
                        <div className="rounded-[1.4rem] border border-[#6f8456]/18 bg-[linear-gradient(180deg,rgba(255,251,244,0.82),rgba(223,236,208,0.88),rgba(233,224,207,0.78))] p-4 shadow-[0_18px_50px_-36px_rgba(75,54,31,0.9)] backdrop-blur-xl sm:rounded-[1.75rem] sm:p-8">
                            <p className="text-xl leading-[1.5] tracking-[-0.02em] text-[#2c2118] sm:text-3xl sm:leading-[1.55] sm:tracking-[-0.03em] lg:text-3xl">
                                &ldquo;{activeTestimonial[0]}&rdquo;
                            </p>
                            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#6f8456] sm:mt-5 sm:text-sm sm:tracking-[0.3em]">
                                {activeTestimonial[1]}
                            </p>
                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/40 sm:mt-6">
                                <div
                                    key={testimonialTick}
                                    className="testimonial-progress h-full rounded-full bg-[linear-gradient(90deg,rgba(111,132,86,0.98),rgba(139,171,99,0.96),rgba(196,162,106,0.94))]"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-1">
                            {testimonials.map(([quote, name], index) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => {
                                        setTestimonialIndex(index);
                                        setTestimonialTick((value) => value + 1);
                                    }}
                                    className={`glass-button glass-button--soft rounded-[1.1rem] border p-3.5 text-left sm:rounded-[1.4rem] sm:p-4 ${index === testimonialIndex
                                            ? 'border-[#cfb898] bg-white/58 shadow-[0_18px_40px_-32px_rgba(66,46,22,0.85)]'
                                            : 'border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.32),rgba(239,231,217,0.2))] shadow-[0_14px_32px_-28px_rgba(66,46,22,0.45)]'
                                        }`}
                                    aria-pressed={index === testimonialIndex}
                                >
                                    <p className="text-xs text-[#5f4a3a] sm:text-sm">{quote}</p>
                                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d6e45] sm:mt-3 sm:text-xs sm:tracking-[0.28em]">
                                        {name}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
                <div className="grid gap-5 rounded-[1.6rem] border border-[#6f8456]/22 bg-[linear-gradient(180deg,rgba(255,251,244,0.72),rgba(218,233,208,0.78),rgba(227,214,195,0.5))] p-4 shadow-[0_28px_80px_-50px_rgba(63,44,23,0.9)] backdrop-blur-xl sm:gap-6 sm:rounded-[2rem] sm:p-6 lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6f8456]">About</p>
                        {/* Update this placeholder duration before launch. */}
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#2d2118] sm:mt-3 sm:text-4xl sm:tracking-[-0.05em] lg:text-4xl">
                            5 years in business, focused on clear pricing and careful delivery.
                        </h2>
                        <div className="mt-3 h-px w-24 bg-[linear-gradient(90deg,#6f8456,#c4a26a,#7b5232)] sm:mt-4 sm:w-28" />
                    </div>
                    <p className="self-end text-sm leading-7 text-[#5d4a3b] sm:text-lg sm:leading-8">
                        Pro Green Build works with homeowners who want renovation work that feels calm, looks warm, and stays grounded in sensible pricing.
                    </p>
                </div>
            </section>

            {/* CONTACT / FOOTER */}
            <footer id="contact" className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
                <div className="rounded-[1.6rem] border border-[#6f8456]/22 bg-[linear-gradient(180deg,rgba(255,251,244,0.82),rgba(221,233,207,0.9),rgba(225,212,188,0.74))] p-4 shadow-[0_24px_80px_-56px_rgba(55,39,23,0.9)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6f8456]">Contact</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#2d2118] sm:mt-3 sm:text-4xl sm:tracking-[-0.05em] lg:text-4xl">
                                Ready when you are.
                            </h2>
                            <div className="mt-3 h-px w-24 bg-[linear-gradient(90deg,#6f8456,#c4a26a,#7b5232)] sm:mt-4 sm:w-28" />
                            <p className="mt-3 text-sm leading-7 text-[#4f5f49] sm:mt-4 sm:text-base sm:leading-8">Call, email, or follow the social links below.</p>
                        </div>

                        <div className="flex flex-wrap gap-2.5 text-xs font-medium sm:gap-3 sm:text-sm">
                            <a href="tel:94526886" className="glass-button glass-button--chip px-4 py-2.5 sm:px-5 sm:py-3">9452 6886</a>
                            {/* Placeholder/testing email. Replace with the real business contact before launch. */}
                            <a href="mailto:shabirali0228@gmail.com" className="glass-button glass-button--chip px-4 py-2.5 sm:px-5 sm:py-3">
                                shabirali0228@gmail.com
                            </a>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2.5 text-xs sm:mt-6 sm:gap-3 sm:text-sm">
                        <a href="#" className="glass-button glass-button--chip px-3.5 py-1.5 sm:px-4 sm:py-2">Instagram</a>
                        <a href="#" className="glass-button glass-button--chip px-3.5 py-1.5 sm:px-4 sm:py-2">Facebook</a>
                        <a href="#" className="glass-button glass-button--chip px-3.5 py-1.5 sm:px-4 sm:py-2">WhatsApp</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}