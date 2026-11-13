import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '../../layouts/admin-layout';

type CommentStatus = 'pending' | 'approved' | 'rejected';

type AdminComment = {
    id: number;
    userName: string;
    productName: string;
    rating: number;
    body: string;
    date: string;
    status: CommentStatus;
};

type Props = {
    comments?: AdminComment[];
    counts?: {
        pending: number;
        approved: number;
        rejected: number;
    };
};

const statusLabels: Record<CommentStatus, string> = {
    pending: 'در انتظار بررسی',
    approved: 'تأییدشده',
    rejected: 'ردشده',
};

const statusStyles: Record<CommentStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
};

function formatDate(value: string) {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

function StatCard({
    title,
    count,
    icon,
    color,
}: {
    title: string;
    count: number;
    icon: string;
    color: string;
}) {
    return (
        <div className="rounded-2xl border border-[#dfc5a5] bg-[#ead5bb] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm text-[#53645b]">{title}</p>
                    <p className={`mt-2 text-3xl font-extrabold ${color}`}>
                        {count.toLocaleString('fa-IR')}
                    </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8e8d5] text-2xl">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function AdminComments({
    comments = [],
    counts,
}: Props) {
    const [activeStatus, setActiveStatus] =
        useState<CommentStatus | 'all'>('pending');

    const [search, setSearch] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    const calculatedCounts = useMemo(
        () => ({
            pending: comments.filter((item) => item.status === 'pending').length,
            approved: comments.filter((item) => item.status === 'approved').length,
            rejected: comments.filter((item) => item.status === 'rejected').length,
        }),
        [comments],
    );

    const stats = counts ?? calculatedCounts;

    const filteredComments = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();

        return comments.filter((item) => {
            const matchesStatus =
                activeStatus === 'all' || item.status === activeStatus;

            const matchesSearch =
                !query ||
                item.userName.toLocaleLowerCase().includes(query) ||
                item.productName.toLocaleLowerCase().includes(query) ||
                item.body.toLocaleLowerCase().includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [comments, activeStatus, search]);

    function moderateComment(
    comment: AdminComment,
    action: 'approve' | 'reject',
) {
    if (processingId !== null) return;

    const confirmed = window.confirm(
        action === 'approve'
            ? `نظر کاربر «${comment.userName}» تأیید شود؟`
            : `نظر کاربر «${comment.userName}» رد شود؟`,
    );

    if (!confirmed) return;

    setProcessingId(comment.id);

    const adminBasePath = window.location.pathname.replace(
        /\/panel\/comments\/?$/,
        '',
    );

    router.post(
        `${adminBasePath}/comment/${comment.id}/${action}`,
        {},
        {
            preserveScroll: true,
            onFinish: () => setProcessingId(null),
        },
    );
}

    return (
        <AdminLayout title="مدیریت نظرات">
            <Head title="مدیریت نظرات" />

            <div
                dir="rtl"
                className="min-h-screen space-y-6 bg-[#f3e0c8] p-4 text-[#103e39] sm:p-6 lg:p-8"
            >
                {/* عنوان صفحه */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-extrabold sm:text-3xl">
                            مدیریت نظرات
                        </h1>

                        <p className="mt-2 text-sm text-[#53645b] sm:text-base">
                            بررسی، تأیید و مدیریت نظرات کاربران فروشگاه
                        </p>
                    </div>

                    <Link
            href={window.location.pathname.replace(/\/panel\/comments\/?$/, '/panel')}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#103e39] px-5 py-3 font-bold text-[#f8e8d5] transition hover:bg-[#18534b]"
                        >
                    <span aria-hidden="true">←</span>
                             بازگشت به پنل
                    </Link>
                </div>

                {/* آمار */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    <StatCard
                        title="در انتظار تأیید"
                        count={stats.pending}
                        icon="◷"
                        color="text-[#76202a]"
                    />

                    <StatCard
                        title="تأییدشده"
                        count={stats.approved}
                        icon="✓"
                        color="text-[#103e39]"
                    />

                    <StatCard
                        title="ردشده"
                        count={stats.rejected}
                        icon="×"
                        color="text-[#76202a]"
                    />
                </div>

                {/* فهرست نظرات */}
                <section className="overflow-hidden rounded-2xl border border-[#d4b99a] bg-[#ead5bb]">
                    <div className="border-b border-[#d4b99a] p-4 sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-xl font-extrabold">
                                    نظرات کاربران
                                </h2>

                                <p className="mt-1 text-sm text-[#53645b]">
                                    نظرات را بر اساس وضعیت یا نام کاربر و محصول پیدا کنید.
                                </p>
                            </div>

                            <div className="w-full lg:max-w-sm">
                                <label
                                    htmlFor="comment-search"
                                    className="sr-only"
                                >
                                    جست‌وجوی نظرات
                                </label>

                                <input
                                    id="comment-search"
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="جست‌وجوی کاربر، محصول یا متن نظر..."
                                    className="w-full rounded-xl border border-[#cdb493] bg-[#f8e8d5] px-4 py-3 text-sm outline-none placeholder:text-[#817765] focus:border-[#103e39] focus:ring-2 focus:ring-[#103e39]/15"
                                />
                            </div>
                        </div>

                        {/* فیلتر وضعیت */}
                        <div className="mt-5 flex flex-wrap gap-2">
                            {(
                                [
                                    ['pending', 'در انتظار بررسی'],
                                    ['approved', 'تأییدشده'],
                                    ['rejected', 'ردشده'],
                                    ['all', 'همه نظرات'],
                                ] as const
                            ).map(([value, label]) => {
                                const isActive = activeStatus === value;

                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setActiveStatus(value)}
                                        className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                                            isActive
                                                ? 'bg-[#103e39] text-[#f8e8d5]'
                                                : 'border border-[#cdb493] bg-[#f8e8d5] text-[#294c43] hover:bg-[#e5cfb3]'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4 p-4 sm:p-6">
                        {filteredComments.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#cdb493] bg-[#f8e8d5] px-5 py-12 text-center">
                                <div className="text-4xl" aria-hidden="true">
                                    ◉
                                </div>

                                <h3 className="mt-4 text-lg font-extrabold">
                                    نظری برای نمایش وجود ندارد
                                </h3>

                                <p className="mt-2 text-sm text-[#53645b]">
                                    با انتخاب وضعیت دیگر یا تغییر عبارت جست‌وجو دوباره بررسی کنید.
                                </p>
                            </div>
                        ) : (
                            filteredComments.map((comment) => (
                                <article
                                    key={comment.id}
                                    className="rounded-2xl border border-[#d4b99a] bg-[#f8e8d5] p-4 sm:p-5"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h3 className="font-extrabold">
                                                {comment.userName}
                                            </h3>

                                            <p className="mt-1 text-sm text-[#53645b]">
                                                محصول: {comment.productName}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[comment.status]}`}
                                            >
                                                {statusLabels[comment.status]}
                                            </span>

                                            <span className="text-xs text-[#736b5e]">
                                                {formatDate(comment.date)}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="mt-4 flex items-center gap-1 text-xl text-[#76202a]"
                                        aria-label={`امتیاز ${comment.rating} از ۵`}
                                    >
                                        {Array.from(
                                            { length: 5 },
                                            (_, index) => (
                                                <span
                                                    key={index}
                                                    className={
                                                        index < comment.rating
                                                            ? ''
                                                            : 'text-[#c9b99f]'
                                                    }
                                                >
                                                    ★
                                                </span>
                                            ),
                                        )}

                                        <span className="mr-2 text-sm font-bold text-[#53645b]">
                                            {comment.rating.toLocaleString('fa-IR')} از ۵
                                        </span>
                                    </div>

                                    <p className="mt-4 whitespace-pre-wrap break-words leading-8 text-[#294c43]">
                                        {comment.body}
                                    </p>

                                    {comment.status === 'pending' && (
                                        <div className="mt-5 flex flex-wrap gap-3 border-t border-[#e2cdb1] pt-4">
                                            <button
                                                type="button"
                                                disabled={processingId !== null}
                                                onClick={() =>
                                                    moderateComment(
                                                        comment,
                                                        'approve',
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#103e39] px-5 py-3 font-bold text-[#f8e8d5] transition hover:bg-[#18534b] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {processingId === comment.id
                                                    ? 'در حال پردازش...'
                                                    : '✓ تأیید نظر'}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={processingId !== null}
                                                onClick={() =>
                                                    moderateComment(
                                                        comment,
                                                        'reject',
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-xl border border-[#76202a] px-5 py-3 font-bold text-[#76202a] transition hover:bg-[#76202a]/10 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {processingId === comment.id
                                                    ? 'در حال پردازش...'
                                                    : '× رد نظر'}
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}

