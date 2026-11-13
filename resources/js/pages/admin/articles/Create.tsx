
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../layouts/admin-layout';

type ArticleForm = {
    title: string;
    author: string;
    body: string;
    image: File | null;
};

export default function CreateArticle() {
    const { data, setData, post, processing, errors, progress } =
        useForm<ArticleForm>({
            title: '',
            author: '',
            body: '',
            image: null,
        });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post(
            `${window.location.pathname.replace(/\/admin\/articles\/create\/?$/, '')}/admin/articles`,
            {
                forceFormData: true,
            },
        );
    }

    return (
        <AdminLayout title="افزودن مقاله">
            <Head title="افزودن مقاله | وبلاگ نسل آفتاب" />

            <main dir="rtl" className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        افزودن مقاله جدید
                    </h1>

                    <Link
                        href={window.location.pathname.replace(
                            /\/admin\/articles\/create\/?$/,
                            '/admin/articles',
                        )}
                        className="text-sm font-medium text-gray-600 hover:text-amber-700"
                    >
                        بازگشت به مقالات
                    </Link>
                </div>

                <form
                    onSubmit={submit}
                    encType="multipart/form-data"
                    className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8"
                >
                    <div>
                        <label
                            htmlFor="title"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            عنوان مقاله
                        </label>

                        <input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(event) =>
                                setData('title', event.target.value)
                            }
                            required
                            maxLength={255}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-600"
                            placeholder="عنوان مقاله را وارد کن"
                        />

                        {errors.title && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="author"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            نام نویسنده
                        </label>

                        <input
                            id="author"
                            type="text"
                            value={data.author}
                            onChange={(event) =>
                                setData('author', event.target.value)
                            }
                            required
                            maxLength={255}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-600"
                            placeholder="نام نویسنده"
                        />

                        {errors.author && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.author}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="body"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            متن مقاله
                        </label>

                        <textarea
                            id="body"
                            value={data.body}
                            onChange={(event) =>
                                setData('body', event.target.value)
                            }
                            required
                            rows={16}
                            className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 leading-8 outline-none focus:border-amber-600"
                            placeholder="متن کامل مقاله را اینجا بنویس..."
                        />

                        {errors.body && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.body}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="image"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            تصویر شاخص مقاله (اختیاری)
                        </label>

                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                                setData(
                                    'image',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                            className="block w-full rounded-xl border border-gray-300 p-3 text-sm"
                        />

                        <p className="mt-2 text-xs text-gray-500">
                            حداکثر حجم تصویر: ۵ مگابایت
                        </p>

                        {errors.image && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.image}
                            </p>
                        )}

                        {progress && (
                            <div className="mt-3">
                                <div className="mb-1 text-sm text-gray-600">
                                    آپلود تصویر: {progress.percentage}٪
                                </div>
                                <progress
                                    value={progress.percentage}
                                    max={100}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-amber-700 px-6 py-3 font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'در حال ثبت...' : 'ثبت مقاله'}
                        </button>

                        <Link
                            href={window.location.pathname.replace(
                                /\/admin\/articles\/create\/?$/,
                                '/admin/articles',
                            )}
                            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            انصراف
                        </Link>
                    </div>
                </form>
            </main>
        </AdminLayout>
    );
}
