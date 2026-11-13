
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '../../layouts/shop-layout';

type Article = {
    id: number;
    title: string;
    body: string;
    author: string;
    image: string | null;
    created_at: string;
};

type Props = {
    article: Article;
};

export default function BlogShow({ article }: Props) {
    const imageUrl = article.image
        ? article.image.startsWith('http')
            ? article.image
            : `/storage/${article.image.replace(/^\/?storage\//, '')}`
        : null;

    return (
        <ShopLayout>
            <Head title={`${article.title} | وبلاگ نسل آفتاب`} />

           <main
    dir="rtl"
    className="relative mx-auto min-h-screen w-full max-w-4xl px-4 pb-16 pt-28 sm:pt-32"
>
                <Link
                    href="/blog"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                    ← بازگشت به وبلاگ
                </Link>

                <article className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={article.title}
                            className="max-h-[480px] w-full object-cover"
                        />
                    )}

                    <div className="p-5 sm:p-8">
                        <h1 className="text-2xl font-bold leading-relaxed text-gray-900 sm:text-4xl">
                            {article.title}
                        </h1>

                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-gray-100 pb-5 text-sm text-gray-500">
                            <span>نویسنده: {article.author}</span>
                            <time dateTime={article.created_at}>
                                {new Date(article.created_at).toLocaleDateString('fa-IR')}
                            </time>
                        </div>

                        <div className="mt-8 whitespace-pre-wrap break-words text-base leading-9 text-gray-700">
                            {article.body}
                        </div>
                    </div>
                </article>
            </main>
        </ShopLayout>
    );
}
