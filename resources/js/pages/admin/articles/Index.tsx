
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../layouts/admin-layout';

type Article = {
    id: number;
    title: string;
    author: string;
    image: string | null;
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    articles: {
        data: Article[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
};

export default function AdminArticlesIndex({ articles }: Props) {
    function deleteArticle(article: Article) {
        if (!window.confirm(`مقاله «${article.title}» حذف شود؟`)) {
            return;
        }

        router.delete(
            `/admin-${window.location.pathname.split('/')[1]?.split('-')[1]}/${window.location.pathname.split('/')[2]}/admin/articles/${article.id}`,
            {
                onSuccess: () => {
                    // حذف با موفقیت انجام شد.
                },
            },
        );
    }

    return (
        <AdminLayout title="مدیریت مقالات">
            <Head title="مدیریت مقالات" />

            <div dir="rtl" className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            مدیریت مقالات وبلاگ
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            ایجاد، ویرایش و مدیریت مقاله‌های نسل آفتاب
                        </p>
                    </div>

                    <Link
                        href={`${window.location.pathname.replace(/\/admin\/articles\/?$/, '')}/admin/articles/create`}
                        className="rounded-xl bg-amber-700 px-5 py-3 font-semibold text-white transition hover:bg-amber-800"
                    >
                        + افزودن مقاله
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                    <table className="w-full min-w-[650px] text-right">
                        <thead className="bg-gray-50 text-sm text-gray-600">
                            <tr>
                                <th className="px-5 py-4">تصویر</th>
                                <th className="px-5 py-4">عنوان</th>
                                <th className="px-5 py-4">نویسنده</th>
                                <th className="px-5 py-4">تاریخ ایجاد</th>
                                <th className="px-5 py-4">عملیات</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {articles.data.map((article) => (
                                <tr key={article.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4">
                                        {article.image ? (
                                            <img
                                                src={
                                                    article.image.startsWith('http')
                                                        ? article.image
                                                        : `/storage/${article.image.replace(/^\/?storage\//, '')}`
                                                }
                                                alt={article.title}
                                                className="h-14 w-20 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                بدون تصویر
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 font-medium text-gray-900">
                                        {article.title}
                                    </td>

                                    <td className="px-5 py-4 text-gray-600">
                                        {article.author}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-gray-500">
                                        {new Date(article.created_at).toLocaleDateString('fa-IR')}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`/blog/${article.id}`}
                                                className="text-sm font-medium text-blue-700 hover:underline"
                                                target="_blank"
                                            >
                                                مشاهده
                                            </Link>

                                            <Link
                                                href={`${window.location.pathname.replace(/\/admin\/articles\/?$/, '')}/admin/articles/${article.id}/edit`}
                                                className="text-sm font-medium text-amber-700 hover:underline"
                                            >
                                                ویرایش
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => deleteArticle(article)}
                                                className="text-sm font-medium text-red-600 hover:underline"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {articles.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-12 text-center text-gray-500"
                                    >
                                        هنوز مقاله‌ای ثبت نشده است.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {articles.last_page > 1 && (
                    <nav className="mt-6 flex flex-wrap justify-center gap-2">
                        {articles.links.map((page, index) => (
                            <Link
                                key={`${page.label}-${index}`}
                                href={page.url ?? '#'}
                                preserveScroll
                                className={`rounded-lg border px-4 py-2 text-sm ${
                                    page.active
                                        ? 'border-amber-700 bg-amber-700 text-white'
                                        : 'border-gray-200 bg-white text-gray-700'
                                }`}
                            >
                                <span
                                    dangerouslySetInnerHTML={{ __html: page.label }}
                                />
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </AdminLayout>
    );
}
