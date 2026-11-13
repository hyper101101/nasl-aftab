import { Head } from '@inertiajs/react';
import ShopLayout from '../layouts/shop-layout';
import FactoryIntro from '../components/home/factory-intro';
import ProductCarousel from '../components/home/product-carousel';
import ProcessSteps from '../components/home/process-steps';
import ContactCta from '../components/home/contact-cta';
import type { Product } from '../data/products';

type HomeProps = {
    featuredProducts: Product[];
};

const categories = [
    {
        title: 'زرشک',
        description: 'زرشک خراسان جنوبی',
        href: '/products/zereshk',
        image: '/images/zereshk.png',
    },
    {
        title: 'گل محمدی',
        description: 'گلبرگ‌های خشک‌شده',
        href: '/products/gol-mohammadi',
        image: '/images/golmohammadi.png',
    },
    {
        title: 'زعفران',
        description: 'زعفران خراسان',
        href: '/products/zaferan',
        image: '/images/zafferan.png',
    },
    {
        title: 'سایر محصولات',
        description: 'تنوع محصولات مجموعه',
        href: '/products/other',
        image: '/images/sayer.png',
    },
];

export default function Home({ featuredProducts }: HomeProps) {
    return (
        <ShopLayout>
            <Head title="نسل  آفتاب | خرید زرشک، گل محمدی و زعفران">
                <meta
                    head-key="description"
                    name="description"
                    content="خرید زرشک، گل محمدی و زعفران از مجموعه نسل آفتاب در قائنات، خراسان جنوبی."
                />
            </Head>

            {/* بنر اصلی */}
            <FactoryIntro />

            {/* دسته‌بندی‌های فروشگاه */}
            <section
                aria-labelledby="categories-title"
                className="relative z-10 -mt-10 rounded-t-[2rem] bg-cream px-4 pb-14 pt-10 text-pine sm:rounded-t-[2.5rem] sm:pt-14 md:pb-20"
            >
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-bordo">
                                محصولات ما
                            </p>

                            <h2
                                id="categories-title"
                                className="mt-2 text-2xl font-extrabold sm:text-3xl"
                            >
                                از کدام دسته خرید می‌کنید؟
                            </h2>
                        </div>

                        <a
                            href="/products"
                            className="text-sm font-bold text-bordo underline decoration-bordo/40 underline-offset-4 transition hover:text-pine"
                        >
                            مشاهده همه محصولات ←
                        </a>
                    </div>

                    <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {categories.map((category) => (
                            <a
                                key={category.href}
                                href={category.href}
                                className="group overflow-hidden rounded-2xl border border-pine/10 bg-white/80 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-bordo/30 hover:shadow-xl"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-pine/5">
                                    <img
                                        src={category.image}
                                        alt={category.title}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />

                                    <div
                                        aria-hidden="true"
                                        className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-pine/80 to-transparent"
                                    />

                                    <span className="absolute bottom-3 right-4 text-lg font-extrabold text-white">
                                        {category.title}
                                    </span>
                                </div>

                                <div className="p-4">
                                    <p className="text-sm leading-6 text-pine/65">
                                        {category.description}
                                    </p>

                                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-bordo transition-all group-hover:gap-3">
                                        مشاهده محصولات
                                        <span aria-hidden="true">←</span>
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* محصولات منتخب فعلی */}
            <ProductCarousel products={featuredProducts} />

            {/* فرایند تولید */}
            <ProcessSteps />

            {/* اطلاعات تماس */}
            <ContactCta />
        </ShopLayout>
    );
}

