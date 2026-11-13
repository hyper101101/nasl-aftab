
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '../../../layouts/admin-layout';

type ChatItem = {
    id: number;
    status: 'pending' | 'open' | 'close';
    last_message_at: string | null;
    updated_at?: string | null;
    messages_count?: number;
    user?: { id: number; name?: string; phone?: string } | null;
    product?: { id: number; name?: string; slug?: string; image?: string | null } | null;
    messages?: Array<{
        id: number;
        body: string;
        created_at?: string | null;
    }>;
    last_message?: { body: string; created_at?: string | null } | null;
};

type Props = {
    chats: ChatItem[];
};

const statusLabels: Record<ChatItem['status'], string> = {
    pending: 'در انتظار پذیرش',
    open: 'در حال گفتگو',
    close: 'بسته شده',
};

function formatDate(value?: string | null) {
    if (!value) return 'زمان نامشخص';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'زمان نامشخص';

    return new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
}

function statusClass(status: ChatItem['status']) {
    if (status === 'pending') {
        return 'bg-amber-100 text-amber-800';
    }

    if (status === 'open') {
        return 'bg-emerald-100 text-emerald-800';
    }

    return 'bg-pine/10 text-pine/65';
}

export default function ChatList({ chats = [] }: Props) {
    const [filter, setFilter] = useState<'all' | ChatItem['status']>('all');
    const [query, setQuery] = useState('');

    const filteredChats = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase();

        return chats.filter((chat) => {
            const matchesStatus = filter === 'all' || chat.status === filter;
            const searchableText = [
                chat.user?.name,
                chat.user?.phone,
                chat.product?.name,
                chat.last_message?.body,
                chat.messages?.[chat.messages.length - 1]?.body,
            ]
                .filter(Boolean)
                .join(' ')
                .toLocaleLowerCase();

            return matchesStatus && (!normalizedQuery || searchableText.includes(normalizedQuery));
        });
    }, [chats, filter, query]);

    return (
        <AdminLayout title="مدیریت چت‌ها">
            <Head title="مدیریت چت‌ها" />

            <div dir="rtl" className="mx-auto max-w-6xl px-4 py-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold">مدیریت چت‌ها</h1>
                        <p className="mt-2 text-sm text-pine/70">
                            بررسی پرسش‌های مشتریان و پاسخ‌گویی درباره محصولات
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.reload({ only: ['chats'] })}
                        className="rounded-xl border border-pine/20 px-4 py-2.5 font-bold transition hover:bg-pine/5"
                    >
                        بروزرسانی فهرست
                    </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {([
                        ['all', 'همه گفتگوها', chats.length],
                        ['pending', 'در انتظار پذیرش', chats.filter((chat) => chat.status === 'pending').length],
                        ['open', 'گفتگوهای فعال', chats.filter((chat) => chat.status === 'open').length],
                    ] as const).map(([value, label, count]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value)}
                            className={`rounded-2xl border p-4 text-start transition ${
                                filter === value
                                    ? 'border-pine bg-pine text-cream'
                                    : 'border-pine/15 bg-white hover:bg-pine/5'
                            }`}
                        >
                            <span className="block text-sm opacity-80">{label}</span>
                            <span className="mt-2 block text-2xl font-extrabold">
                                {count.toLocaleString('fa-IR')}
                            </span>
                        </button>
                    ))}
                </div>

                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="جستجو با نام مشتری، محصول یا متن پیام..."
                    className="mt-6 w-full rounded-xl border border-pine/20 bg-white px-4 py-3 outline-none focus:border-pine focus:ring-2 focus:ring-pine/15"
                />

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {filteredChats.map((chat) => {
                        const lastMessage =
                            chat.last_message?.body ??
                            chat.messages?.[chat.messages.length - 1]?.body ??
                            'هنوز پیامی ثبت نشده است.';

                        const lastMessageTime =
                            chat.last_message?.created_at ??
                            chat.last_message_at ??
                            chat.updated_at;

                        return (
                            <article
                                key={chat.id}
                                className="min-w-0 rounded-2xl border border-pine/15 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs text-pine/60">
                                            گفتگوی شماره {chat.id.toLocaleString('fa-IR')}
                                        </p>
                                        <h2 className="mt-1 truncate text-lg font-extrabold">
                                            {chat.product?.name ?? 'محصول حذف‌شده یا نامشخص'}
                                        </h2>
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusClass(chat.status)}`}
                                    >
                                        {statusLabels[chat.status]}
                                    </span>
                                </div>

                                <div className="mt-4 rounded-xl bg-cream p-3">
                                    <p className="text-sm font-bold">
                                        مشتری: {chat.user?.name ?? 'نامشخص'}
                                    </p>
                                    {chat.user?.phone && (
                                        <p dir="ltr" className="mt-1 text-start text-xs text-pine/65">
                                            {chat.user.phone}
                                        </p>
                                    )}
                                </div>

                                <p className="mt-4 text-xs font-bold text-pine/60">
                                    آخرین پیام
                                </p>
                                <p className="mt-1 break-words text-sm leading-7">
                                    {lastMessage}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-pine/60">
                                    <span>زمان: {formatDate(lastMessageTime)}</span>
                                    <span>
                                        {(chat.messages_count ?? chat.messages?.length ?? 0).toLocaleString('fa-IR')} پیام
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => router.visit(`/chat/${chat.id}`)}
                                    className="mt-5 w-full rounded-xl bg-pine px-4 py-3 font-bold text-cream transition hover:bg-pine/90"
                                >
                                    {chat.status === 'pending'
                                        ? 'مشاهده و پذیرش گفتگو'
                                        : chat.status === 'open'
                                          ? 'پاسخ به گفتگو'
                                          : 'مشاهده گفتگو'}
                                </button>
                            </article>
                        );
                    })}
                </div>

                {filteredChats.length === 0 && (
                    <div className="mt-6 rounded-2xl border border-dashed border-pine/20 p-10 text-center">
                        <p className="font-bold">گفتگویی با این شرایط پیدا نشد.</p>
                        <p className="mt-2 text-sm text-pine/60">
                            فیلتر یا عبارت جستجو را تغییر بده.
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
