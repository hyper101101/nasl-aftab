const benefits = [
    {
        title: 'مستقیم از کارخانه، بدون واسطه',
        text: 'محصول از باغ و کارخانه‌ی خودمان مستقیم به شما می‌رسد و واسطه‌ای در مسیر نیست.',
        icon: 'M3 21h18M5 21V10l5 3.5V10l5 3.5V5h4v16',
    },
    {
        title: 'پاک‌سازی و دم گیری دقیق',
        text: 'دم، خاک و ناخالصی پیش از بسته‌بندی جدا می‌شود تا محصول تمیز و آماده استفاده به دست شما برسد.',
        icon: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
    },
    {
        title: 'بسته‌بندی بهداشتی، استاندارد و باکیفیت',
        text: 'از بسته‌ های کوچک  تا کارتن‌های عمده برای استفاده.',
        icon: 'M3 7.5L12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9',
    },
    {
        title: 'پاسخ‌گویی مستقیم',
        text: 'برای مشاوره و سفارش، مستقیم با مدیریت و حسابداری کارخانه در تماس هستید.',
        icon: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
    },
];

const eyebrow = [
    'glass inline-flex items-center gap-2 rounded-full bg-cream/5',
    'px-4 py-1.5 text-sm text-cream/80',
].join(' ');

const mark = [
    'rounded-xl bg-bordo px-3 py-0.5 text-cream ring-1 ring-cream/25',
    'box-decoration-clone',
].join(' ');

const primaryBtn = [
    'inline-flex items-center justify-center rounded-xl bg-cream px-7 py-3.5',
    'font-bold text-pine transition-colors hover:bg-cream/85',
].join(' ');

const ghostBtn = [
    'glass inline-flex items-center justify-center rounded-xl bg-cream/5 px-7 py-3.5',
    'font-medium text-cream transition-colors hover:bg-cream/10',
].join(' ');

const panel = 'glass rounded-3xl bg-cream/5 p-6 sm:p-8';

const iconTile = [
    'flex size-11 shrink-0 items-center justify-center rounded-xl',
    'bg-bordo text-cream ring-1 ring-cream/25',
].join(' ');

export default function FactoryIntro() {
    return (
        <section
            aria-labelledby="hero-title"
            className="relative isolate overflow-hidden bg-pine pb-28 pt-32 md:pb-36 md:pt-40"
        >
            <div aria-hidden="true" className="absolute -end-24 top-10 -z-10 size-[28rem] rounded-full bg-cream/10 blur-3xl" />
            <div aria-hidden="true" className="absolute -start-32 bottom-0 -z-10 size-96 rounded-full bg-bordo/60 blur-3xl" />

            <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                    <p className={eyebrow}>
                        <span className="size-2 rounded-full bg-cream" aria-hidden="true" />
                        قائنات، خراسان جنوبی
                    </p>

                    <h1 id="hero-title" className="mt-6 text-4xl font-extrabold leading-[1.55] md:text-6xl md:leading-[1.5]">
                        کارخانه‌ی بوجاری زرشک  <span className={mark}>از نسل آفتاب</span>
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-8 text-cream/80">
                        زرشک خراسان جنوبی را از کشاورز تحویل می‌گیریم، در کارخانه‌ی خودمان پاک و بسته‌بندی
                        می‌کنیم و به دست شما می‌رسانیم.
                    </p>

                    <div className="mt-9 flex flex-wrap gap-3">
                        <a href="#products" className={primaryBtn}>
                            مشاهده محصولات
                        </a>
                        <a href="#contact" className={ghostBtn}>
                            تماس با ما
                        </a>
                    </div>
                </div>

                <section aria-labelledby="why-title" className={panel}>
                    <h2 id="why-title" className="text-2xl font-extrabold leading-[1.6]">
                        چرا باید از نسل آفتاب خرید کنید؟
                    </h2>

                    <ul className="mt-6 space-y-5">
                        {benefits.map((benefit) => (
                            <li key={benefit.title} className="flex gap-4">
                                <span className={iconTile}>
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="size-6"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d={benefit.icon} />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="font-bold text-cream">{benefit.title}</h3>
                                    <p className="mt-1 text-sm leading-7 text-cream/75">{benefit.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </section>
    );
}
