import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../layouts/admin-layout';

type ChatMessage = {
    id: number;
    body: string;
    created_at: string | null;
    sender_type?: string;
    sender_id?: number;
    sender?: { id: number; name?: string } | null;
};

type Chat = {
    id: number;
    status: 'pending' | 'open' | 'close';
    last_message_at?: string | null;
    user?: { id: number; name?: string; phone?: string } | null;
    product?: { id: number; name?: string; slug?: string } | null;
    admin?: { id: number; name?: string } | null;
};

type Props = {
    chat: Chat;
    messages: ChatMessage[];
};

type PollResponse = {
    chat?: {
        id: number;
        status: 'pending' | 'open' | 'close';
    };
    messages: ChatMessage[];
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

function isAdminMessage(message: ChatMessage) {
    return Boolean(
        message.sender_type?.includes('Admin') ||
        message.sender_type === 'admin',
    );
}

export default function AdminChat({ chat, messages = [] }: Props) {
    const [body, setBody] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const [liveMessages, setLiveMessages] = useState<ChatMessage[]>(messages);
    const [liveStatus, setLiveStatus] = useState<Chat['status']>(chat.status);

    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const shouldScrollRef = useRef(true);

    // همگام‌سازی اطلاعات دریافتی از Inertia
    useEffect(() => {
        setLiveMessages(messages);
    }, [messages]);

    useEffect(() => {
        setLiveStatus(chat.status);
    }, [chat.status]);

    // دریافت خودکار پیام‌ها و وضعیت گفتگو هر دو ثانیه
    useEffect(() => {
        let stopped = false;
        let inFlight = false;
        let controller: AbortController | null = null;

        const pollMessages = async () => {
            if (stopped || inFlight || document.hidden) return;

            inFlight = true;
            controller = new AbortController();

            try {
                const response = await fetch(`/chat/${chat.id}/messages`, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    signal: controller.signal,
                });

                if (!response.ok) return;

                const data: PollResponse = await response.json();

                if (stopped) return;

                if (Array.isArray(data.messages)) {
                    setLiveMessages(data.messages);
                }

                if (
                    data.chat?.status === 'pending' ||
                    data.chat?.status === 'open' ||
                    data.chat?.status === 'close'
                ) {
                    setLiveStatus(data.chat.status);
                }
            } catch (pollError) {
                if (
                    pollError instanceof Error &&
                    pollError.name !== 'AbortError'
                ) {
                    console.error(
                        'خطا در دریافت پیام‌های چت:',
                        pollError,
                    );
                }
            } finally {
                inFlight = false;
            }
        };

        void pollMessages();

        const timer = window.setInterval(() => {
            void pollMessages();
        }, 2000);

        return () => {
            stopped = true;
            window.clearInterval(timer);
            controller?.abort();
        };
    }, [chat.id]);

    // اسکرول به انتهای گفتگو هنگام اضافه شدن پیام جدید
    useEffect(() => {
        if (!shouldScrollRef.current) return;

        bottomRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
    }, [liveMessages.length]);

    function acceptConversation() {
        if (busy || liveStatus !== 'pending') return;

        setBusy(true);
        setError('');

        router.post(
            `/chat/${chat.id}/reception`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLiveStatus('open');
                },
                onError: () => {
                    setError(
                        'پذیرش گفتگو انجام نشد. صفحه را به‌روزرسانی کن و دوباره تلاش کن.',
                    );
                },
                onFinish: () => setBusy(false),
            },
        );
    }

    function sendMessage(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const text = body.trim();

        if (!text || busy || liveStatus !== 'open') return;

        setBusy(true);
        setError('');

        router.post(
            `/chat/${chat.id}/send`,
            { body: text },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setBody('');
                },
                onError: () => {
                    setError(
                        'ارسال پاسخ انجام نشد. متن پیام را بررسی کن.',
                    );
                },
                onFinish: () => setBusy(false),
            },
        );
    }

    function closeConversation() {
        if (busy || liveStatus !== 'open') return;

        if (!window.confirm('مطمئنی می‌خواهی این گفتگو را ببندی؟')) {
            return;
        }

        setBusy(true);
        setError('');

        router.post(
            `/chat/${chat.id}/close`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLiveStatus('close');
                },
                onError: () => {
                    setError('بستن گفتگو انجام نشد.');
                },
                onFinish: () => setBusy(false),
            },
        );
    }

    return (
        <AdminLayout title="پاسخ به چت">
            <Head title={`گفتگوی ${chat.id} | پنل مدیریت`} />

            <div dir="rtl" className="mx-auto max-w-4xl px-4 py-8">
                <Link
                    href="/chat/list"
                    className="inline-flex items-center gap-2 text-sm font-bold text-pine/70 hover:text-pine"
                >
                    <span aria-hidden="true">→</span>
                    بازگشت به فهرست چت‌ها
                </Link>

                <section className="mt-5 overflow-hidden rounded-3xl border border-pine/15 bg-white shadow-sm">
                    <header className="bg-pine p-5 text-cream">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-cream/65">
                                    گفتگوی شماره{' '}
                                    {chat.id.toLocaleString('fa-IR')}
                                </p>

                                <h1 className="mt-1 text-xl font-extrabold">
                                    {chat.product?.name ??
                                        'گفتگو درباره محصول'}
                                </h1>

                                <p className="mt-2 text-sm text-cream/75">
                                    مشتری: {chat.user?.name ?? 'نامشخص'}
                                    {chat.user?.phone
                                        ? ` — ${chat.user.phone}`
                                        : ''}
                                </p>
                            </div>

                            <span className="rounded-full bg-cream/10 px-3 py-1 text-sm">
                                {liveStatus === 'pending'
                                    ? 'در انتظار پذیرش'
                                    : liveStatus === 'open'
                                      ? 'در حال گفتگو'
                                      : 'بسته شده'}
                            </span>
                        </div>
                    </header>

                    {liveStatus === 'pending' && (
                        <div className="border-b border-pine/10 bg-amber-50 p-5">
                            <p className="text-sm leading-7 text-amber-900">
                                برای پاسخ‌گویی، ابتدا این گفتگو را بپذیر.
                                پس از پذیرش، امکان ارسال پیام فعال می‌شود.
                            </p>

                            <button
                                type="button"
                                disabled={busy}
                                onClick={acceptConversation}
                                className="mt-3 rounded-xl bg-pine px-5 py-3 font-bold text-cream disabled:opacity-50"
                            >
                                {busy
                                    ? 'در حال انجام...'
                                    : 'پذیرش گفتگو و شروع پاسخ‌گویی'}
                            </button>
                        </div>
                    )}

                    <div
                        ref={messagesContainerRef}
                        onScroll={(event) => {
                            const element = event.currentTarget;
                            const distanceFromBottom =
                                element.scrollHeight -
                                element.scrollTop -
                                element.clientHeight;

                            shouldScrollRef.current =
                                distanceFromBottom < 100;
                        }}
                        className="max-h-[60vh] min-h-72 space-y-4 overflow-y-auto bg-cream/50 p-4 sm:p-6"
                    >
                        {liveMessages.length === 0 && (
                            <p className="py-10 text-center text-sm text-pine/60">
                                هنوز پیامی در این گفتگو ثبت نشده است.
                            </p>
                        )}

                        {liveMessages.map((message) => {
                            const adminMessage = isAdminMessage(message);

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        adminMessage
                                            ? 'justify-start'
                                            : 'justify-end'
                                    }`}
                                >
                                    <div
                                        className={`max-w-[88%] min-w-0 rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                                            adminMessage
                                                ? 'rounded-tr-sm bg-pine text-cream'
                                                : 'rounded-tl-sm border border-pine/10 bg-white text-pine'
                                        }`}
                                    >
                                        <p className="mb-1 text-xs font-bold opacity-70">
                                            {adminMessage
                                                ? 'پاسخ مدیریت'
                                                : 'پیام مشتری'}
                                        </p>

                                        <p className="whitespace-pre-wrap break-words text-sm leading-7">
                                            {message.body}
                                        </p>

                                        <p className="mt-2 text-start text-[11px] opacity-60">
                                            {formatDate(message.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        <div ref={bottomRef} />
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="border-t border-bordo/20 bg-bordo/5 px-5 py-3 text-sm font-bold text-bordo"
                        >
                            {error}
                        </p>
                    )}

                    {liveStatus === 'open' ? (
                        <form
                            onSubmit={sendMessage}
                            className="border-t border-pine/10 p-4 sm:p-5"
                        >
                            <label
                                htmlFor="admin-chat-message"
                                className="mb-2 block text-sm font-bold"
                            >
                                پاسخ شما
                            </label>

                            <textarea
                                id="admin-chat-message"
                                value={body}
                                onChange={(event) =>
                                    setBody(event.target.value)
                                }
                                rows={3}
                                maxLength={5000}
                                placeholder="پاسخ مشتری را اینجا بنویس..."
                                className="w-full resize-y rounded-xl border border-pine/20 bg-white px-4 py-3 leading-7 outline-none focus:border-pine focus:ring-2 focus:ring-pine/15"
                            />

                            <div className="mt-3 flex flex-wrap justify-between gap-3">
                                <button
                                    type="submit"
                                    disabled={busy || !body.trim()}
                                    className="rounded-xl bg-pine px-6 py-3 font-bold text-cream disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {busy ? 'در حال ارسال...' : 'ارسال پاسخ'}
                                </button>

                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={closeConversation}
                                    className="rounded-xl border border-bordo/30 px-5 py-3 font-bold text-bordo hover:bg-bordo/5 disabled:opacity-50"
                                >
                                    بستن گفتگو
                                </button>
                            </div>
                        </form>
                    ) : liveStatus === 'close' ? (
                        <p className="border-t border-pine/10 p-5 text-sm text-pine/60">
                            این گفتگو بسته شده و امکان ارسال پیام در آن
                            وجود ندارد.
                        </p>
                    ) : null}
                </section>
            </div>
        </AdminLayout>
    );
}

