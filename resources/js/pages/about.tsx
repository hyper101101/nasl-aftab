import { Head } from '@inertiajs/react';
import Photo from '../components/about/photo';
import ContactCta from '../components/home/contact-cta';
import ShopLayout from '../layouts/shop-layout';

// عکس‌ها رو توی public/images/about/ بذار؛ متن alt رو هم با توضیح واقعی هر عکس عوض کن
const manager = {
    src: '/images/about/manager.jpg',
    alt: 'محمد حسین یعقوبی، مدیر کارخانه‌ی نسل آفتاب',
};

const gallery = [
    { src: '/images/about/factory-1.jpg', alt: 'نمایی از کارخانه‌ی نسل آفتاب' },
    { src: '/images/about/factory-2.jpg', alt: 'بخشی از خط کار در کارخانه‌ی نسل آفتاب' },
    { src: '/images/about/barberry-1.jpg', alt: 'زرشک خشک‌شده' },
    { src: '/images/about/barberry-2.jpg', alt: 'زرشک پاک‌شده و آماده‌ی بسته‌بندی' },
    { src: '/images/about/factory-3.jpg', alt: 'بسته‌بندی محصول در کارخانه‌ی نسل آفتاب' },
];

const facts = [
    { label: 'تجربه', value: 'نزدیک ۲۰ سال کشاورزی' },
    { label: 'شروع کار', value: 'روستای محمدآباد علم' },
    { label: 'کارخانه', value: 'قائنات، خراسان جنوبی' },
];

const story = [
    'نسل آفتاب از دل کشاورزی بیرون آمد. نزدیک بیست سال در روستای محمدآباد علم کشاورزی کردیم؛ با زمین، با فصل‌ها و با خود محصول کار کردیم و آنچه بلدیم از همین سال‌ها یاد گرفته‌ایم.',
    'در این مدت بارها دیدیم که یک محصول خوب تا به دست مصرف‌کننده برسد چقدر راه می‌رود و در این راه چقدر از کیفیتش می‌تواند کم شود. برای همین تصمیم گرفتیم مرحله‌های بعد از برداشت را هم خودمان به عهده بگیریم.',
    'کارخانه را در قائنات راه انداختیم. زرشک و گل محمدی از باغ تحویل گرفته می‌شود، در همین کارخانه پاک و بسته‌بندی می‌شود و بدون واسطه به دست مشتری می‌رسد.',
    'کار ما هنوز همان کار قبلی است، فقط حالا بسته‌بندی و فروشش هم با خودمان است. اگر درباره‌ی محصول یا خرید عمده سؤالی داشتید، مستقیم با مدیریت تماس بگیرید؛ جواب را از کسی می‌شنوید که خودش سال‌ها پای کار بوده.',
];

const panel = [
    'on-cream relative z-10 -mt-8 rounded-[2.5rem] bg-cream',
    'pb-20 pt-12 text-pine md:pt-16',
].join(' ');

export default function About() {
    return (
        <ShopLayout>
            <Head title="درباره‌ی ما | کارخانه‌ی نسل آفتاب">
                <meta
                    head-key="description"
                    name="description"
                    content="آشنایی با کارخانه‌ی نسل آفتاب در قائنات و محمد حسین یعقوبی؛ کشاورزی با نزدیک ۲۰ سال تجربه در روستای محمدآباد علم، تولیدکننده‌ی زرشک و گل محمدی."
                />
            </Head>

            <section aria-labelledby="about-title" className="bg-pine pb-16 pt-28 md:pb-20 md:pt-36">
                <div className="mx-auto max-w-6xl px-4">
                    <h1 id="about-title" className="text-4xl font-extrabold leading-[1.5] md:text-5xl">
                        درباره‌ی نسل آفتاب
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg leading-8 text-cream/80">
                        کشاورزهایی که حالا بسته‌بندی و فروش محصولشان را هم خودشان انجام می‌دهند.
                    </p>
                </div>
            </section>

            <div className={panel}>
                <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[22rem_1fr] lg:gap-16">
                    <figure className="mx-auto w-full max-w-sm self-start lg:sticky lg:top-28">
                        <div className="relative">
                            <div
                                aria-hidden="true"
                                className="absolute -bottom-3 -end-3 size-full rounded-3xl border-2 border-bordo/50"
                            />
                            <Photo
                                src={manager.src}
                                alt={manager.alt}
                                width={800}
                                height={1000}
                                eager
                                className="relative aspect-[4/5] w-full rounded-3xl"
                            />
                        </div>

                        <figcaption className="mt-7 text-center">
                            <p className="text-sm text-pine/70">مدیر کارخانه</p>
                            <p className="mt-1 text-xl font-extrabold">محمد حسین یعقوبی</p>
                        </figcaption>
                    </figure>

                    <div>
                        <h2 className="text-3xl font-extrabold">از باغ شروع کردیم</h2>

                        <div className="mt-6 space-y-5 text-lg leading-9 text-pine/90">
                            {story.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>

                        <dl className="mt-10 grid gap-3 sm:grid-cols-3">
                            {facts.map((fact) => (
                                <div key={fact.label} className="rounded-2xl bg-pine px-5 py-4 text-cream">
                                    <dt className="text-sm text-cream/70">{fact.label}</dt>
                                    <dd className="mt-1 font-bold leading-7">{fact.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            <section
                aria-labelledby="gallery-title"
                className="-mt-10 bg-pine pb-20 pt-28 text-cream md:pb-24 md:pt-32"
            >
                <div className="mx-auto max-w-6xl px-4">
                    <h2 id="gallery-title" className="text-3xl font-extrabold">
                        تصویرهایی از کارخانه و محصول
                    </h2>

                    <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                        {gallery.map((photo, index) => (
                            <li key={photo.src} className={index === 0 ? 'col-span-2 row-span-2' : ''}>
                                <Photo
                                    src={photo.src}
                                    alt={photo.alt}
                                    width={1000}
                                    height={1000}
                                    className="aspect-square w-full rounded-2xl"
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <ContactCta />
        </ShopLayout>
    );
}
