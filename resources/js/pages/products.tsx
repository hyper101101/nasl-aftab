import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../layouts/shop-layout';
import Catalog from '../components/products/catalog';
import { categories, type Product } from '../data/products';

const tabBase = [
    'glass inline-flex items-center rounded-full px-5 py-2.5 font-medium',
    'whitespace-nowrap transition-colors',
].join(' ');

const tabActive = 'bg-cream text-pine';
const tabIdle = 'bg-cream/5 text-cream/85 hover:bg-cream/10';

type Props = {
    category: string;
    products?: Product[];
};

export default function Products({ category: slug, products = [] }: Props) {
    const category = categories.find((c) => c.slug === slug) ?? categories[0];

    return (
        <ShopLayout>
            <Head title={category.metaTitle}>
                <meta
                    head-key="description"
                    name="description"
                    content={category.metaDescription}
                />
            </Head>

            <section
                aria-labelledby="products-title"
                className="relative isolate overflow-hidden bg-pine pb-24 pt-28 md:pb-28 md:pt-36"
            >
                <div
                    aria-hidden="true"
                    className="absolute -end-24 top-0 -z-10 size-96 rounded-full bg-cream/10 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="absolute -start-32 bottom-0 -z-10 size-80 rounded-full bg-bordo/50 blur-3xl"
                />

                <div className="mx-auto max-w-6xl px-4">
                    <nav aria-label="مسیر صفحه" className="text-sm text-cream/70">
                        <ol className="flex flex-wrap items-center gap-2">
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-cream hover:underline"
                                >
                                    خانه
                                </Link>
                            </li>

                            <li aria-hidden="true">/</li>

                            <li>
                                <Link
                                    href="/products/zereshk"
                                    className="hover:text-cream hover:underline"
                                >
                                    محصولات
                                </Link>
                            </li>

                            <li aria-hidden="true">/</li>

                            <li aria-current="page" className="text-cream">
                                {category.label}
                            </li>
                        </ol>
                    </nav>

                    <h1
                        id="products-title"
                        className="mt-5 text-4xl font-extrabold leading-[1.5] md:text-5xl"
                    >
                        {category.title}
                    </h1>

                    <p className="mt-4 max-w-2xl text-lg leading-8 text-cream/80">
                        {category.description}
                    </p>

                    <nav
                        aria-label="دسته‌بندی محصولات"
                        className="-mx-4 mt-8 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        <ul className="flex w-max gap-2">
                            {categories.map((c) => {
                                const current = c.id === category.id;

                                return (
                                    <li key={c.id}>
                                        <Link
                                            href={`/products/${c.slug}`}
                                            preserveScroll
                                            aria-current={current ? 'page' : undefined}
                                            className={`${tabBase} ${current ? tabActive : tabIdle}`}
                                        >
                                            {c.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </section>

            {/* با تغییر دسته‌بندی، فیلترهای قبلی بازنشانی می‌شوند. */}
            <Catalog
                key={category.id}
                category={category}
                products={products}
            />
        </ShopLayout>
    );
}
