import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../layouts/admin-layout';
import { useRef } from 'react';

type Article = {
    id: number;
    title: string;
    body: string;
    author: string;
    image: string | null;
};

type Props = {
    article: Article;
};

export default function Edit({ article }: Props) {
    const fileInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors } = useForm({
        title: article.title ?? '',
        author: article.author ?? '',
        body: article.body ?? '',
        image: null as File | null,
    });

    const currentPath = window.location.pathname;
    const basePath = currentPath.replace(/\/admin\/articles\/\d+\/edit\/?$/, '');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        put(`${basePath}/admin/articles/${article.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title="ویرایش مقاله">
            <Head title={`ویرایش مقاله: ${article.title}`} />

            <div dir="rtl" className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-pine">
                            ویرایش مقاله
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            اطلاعات مقاله را اصلاح و ذخیره کن.
                        </p>
                    </div>

                    <Link
                        href={`${basePath}/admin/articles`}
                        className="rounded-xl border border-pine/20 px-4 py-2.5 font-bold text-pine transition hover:bg-pine/5"
                    >
                        بازگشت به مقالات
                    </Link>
                </div>

                <form
                    onSubmit={submit}
                    encType="multipart/form-data"
                    className="space-y-6 rounded-3xl border border-pine/15 bg-white p-6 shadow-sm"
                >
                    <div>
                        <label
                            htmlFor="title"
                            className="mb-2 block font-bold text-pine"
                        >
                            عنوان مقاله
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pine focus:ring-2 focus:ring-pine/15"
                            required
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="author"
                            className="mb-2 block font-bold text-pine"
                        >
                            نویسنده
                        </label>
                        <input
                            id="author"
                            type="text"
                            value={data.author}
                            onChange={(e) => setData('author', e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pine focus:ring-2 focus:ring-pine/15"
                            required
                        />
                        {errors.author && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.author}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="body"
                            className="mb-2 block font-bold text-pine"
                        >
                            متن مقاله
                        </label>
                        <textarea
                            id="body"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            rows={14}
                            className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 leading-8 outline-none focus:border-pine focus:ring-2 focus:ring-pine/15"
                            required
                        />
                        {errors.body && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.body}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block font-bold text-pine">
                            تصویر فعلی مقاله
                        </label>

                        {article.image ? (
                            <img
                                src={`/storage/${article.image.replace(/^\/?storage\//, '')}`}
                                alt={article.title}
                                className="mb-4 max-h-64 max-w-full rounded-2xl border border-gray-200 object-contain"
                            />
                        ) : (
                            <p className="mb-4 text-sm text-gray-500">
                                برای این مقاله تصویری ثبت نشده است.
                            </p>
                        )}

                        <label
                            htmlFor="image"
                            className="mb-2 block font-bold text-pine"
                        >
                            انتخاب تصویر جدید (اختیاری)
                        </label>
                        <input
                            ref={fileInput}
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData('image', e.target.files?.[0] ?? null)
                            }
                            className="block w-full rounded-xl border border-gray-300 p-3 text-sm"
                        />
                        {errors.image && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.image}
                            </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                            اگر تصویر جدیدی انتخاب نکنی، تصویر فعلی حفظ می‌شود.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-pine px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </button>

                        <Link
                            href={`${basePath}/admin/articles`}
                            className="rounded-xl border border-gray-300 px-6 py-3 font-bold text-gray-700 transition hover:bg-gray-50"
                        >
                            انصراف
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
