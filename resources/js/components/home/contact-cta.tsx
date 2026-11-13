const phones = [
    { label: 'مدیریت', tel: '+989155623847', shown: '0915 562 3847' },
    { label: 'حسابداری', tel: '+989385259404', shown: '0938 525 9404' },
];

const box = [
    'relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-bordo',
    'px-6 py-12 text-cream md:px-14 md:py-16',
].join(' ');

const phoneBtn = [
    'on-cream flex items-center justify-between gap-4 rounded-2xl bg-cream px-5 py-4',
    'text-pine transition-colors hover:bg-cream/90',
].join(' ');

export default function ContactCta() {
    return (
        <section id="contact" aria-labelledby="contact-title" className="bg-pine px-4 pb-16 md:pb-24">
            <div className={box}>
                <svg
                    aria-hidden="true"
                    viewBox="0 0 400 400"
                    className="pointer-events-none absolute -end-24 -top-24 w-80 text-cream md:w-[28rem]"
                >
                    <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                    <circle cx="200" cy="200" r="160" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.14" />
                    <circle cx="200" cy="200" r="198" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.09" />
                </svg>

                <div className="relative max-w-2xl">
                    <h2 id="contact-title" className="text-3xl font-extrabold leading-[1.6] md:text-4xl">
                        برای سفارش عمده یا خرید با مقدار بالا مستقیم با کارخانه تماس بگیرید
                    </h2>
                    <p className="mt-4 leading-8 text-cream/85">
                        برای استعلام قیمت محصولات با مدیریت یا حسابداری تماس بگیرید.
                    </p>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        {phones.map((phone) => (
                            <a key={phone.tel} href={`tel:${phone.tel}`} className={phoneBtn}>
                                <span>
                                    <span className="block text-sm text-pine/75">{phone.label}</span>
                                    <span dir="ltr" className="inline-block text-lg font-bold text-bordo">
                                        {phone.shown}
                                    </span>
                                </span>
                                <svg viewBox="0 0 24 24" className="size-6 text-bordo" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                                </svg>
                            </a>
                        ))}
                    </div>

                    <address className="mt-8 flex items-start gap-3 not-italic leading-8 text-cream/90">
                        <svg viewBox="0 0 24 24" className="mt-1.5 size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" />
                            <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        خراسان جنوبی، شهرستان قائنات، انتهای بلوار کتاب، ابتدای جاده‌ی فیروزآباد
                    </address>
                </div>
            </div>
        </section>
    );
}
