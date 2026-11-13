
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../layouts/shop-layout';

type Article = {
    id: number;
    title: string;
    author: string;
    image: string | null;
    created_at: string;
};

type PaginatedArticles = {
    data: Article[];
    current_page: number;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

type Props = {
    articles: PaginatedArticles;
};

export default function BlogIndex({ articles }: Props) {
    return (
        <ShopLayout>
            <Head title="وبلاگ نسل آفتاب" />

                 <div
                dir="rtl"
                className="relative mx-auto min-h-screen w-full max-w-7xl px-4 pb-16 pt-28 sm:pt-32"
                >
                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        وبلاگ نسل آفتاب
                    </h1>
                    <p className="mt-3 text-gray-600">
                        تازه‌ترین مقاله‌ها، مطالب آموزشی و دانستنی‌ها
                    </p>
                </header>

                {articles.data.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                        هنوز مقاله‌ای منتشر نشده است.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {articles.data.map((article) => (
                            <article
                                key={article.id}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <Link href={`/blog/${article.id}`}>
                                    {article.image ? (
                                        <img
                                            src={
                                                article.image.startsWith('http')
                                                    ? article.image
                                                    : `/storage/${article.image.replace(/^\/?storage\//, '')}`
                                            }
                                            alt={article.title}
                                            className="h-52 w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-52 items-center justify-center bg-gray-100 text-gray-400">
                                            بدون تصویر
                                        </div>
                                    )}
                                </Link>

                                <div className="p-5">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        <Link
                                            href={`/blog/${article.id}`}
                                            className="transition hover:text-amber-700"
                                        >
                                            {article.title}
                                        </Link>
                                    </h2>

                                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-500">
                                        <span>{article.author}</span>
                                        <time dateTime={article.created_at}>
                                            {new Date(article.created_at).toLocaleDateString('fa-IR')}
                                        </time>
                                    </div>

                                    <Link
                                        href={`/blog/${article.id}`}
                                        className="mt-5 inline-flex font-semibold text-amber-700 hover:text-amber-800"
                                    >
                                        ادامه مطلب ←
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {articles.last_page > 1 && (
                    <nav
                        aria-label="صفحه‌بندی مقالات"
                        className="mt-10 flex flex-wrap justify-center gap-2"
                    >
                        {articles.links.map((page, index) => (
                            <Link
                                key={`${page.label}-${index}`}
                                href={page.url ?? '#'}
                                preserveScroll
                                className={`rounded-lg border px-4 py-2 text-sm ${
                                    page.active
                                        ? 'border-amber-700 bg-amber-700 text-white'
                                        : page.url
                                          ? 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                          : 'cursor-not-allowed border-gray-100 text-gray-300'
                                }`}
                                aria-current={page.active ? 'page' : undefined}
                            >
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: page.label,
                                    }}
                                />
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </ShopLayout>
    );
}
