import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type ChatMessage = {
    id: number;
    body: string;
    created_at: string | null;
    sender_type?: string;
    sender_id?: number;
    sender?: {
        id: number;
        name?: string;
    } | null;
};

type Conversation = {
    id: number;
    status: 'pending' | 'open' | 'close';
    product_id: number;
    last_message_at?: string | null;
};

type ProductChatProps = {
    productId: number;
    currentUser: { id: number; name: string } | null;
    conversation: Conversation | null;
    messages: ChatMessage[];
};

type PollResponse = {
    conversation?: {
        id: number;
        status: 'pending' | 'open' | 'close';
        product_id: number;
    };
    messages?: ChatMessage[];
};

function formatDateTime(value: string | null) {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
}

export default function ProductChat({
    productId,
    currentUser,
    conversation,
    messages,
}: ProductChatProps) {
    const [expanded, setExpanded] = useState(false);
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const [liveMessages, setLiveMessages] = useState<ChatMessage[]>(messages);
    const [liveStatus, setLiveStatus] = useState<
    'pending' | 'open' | 'close' | null
>(conversation?.status ?? null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const shouldScrollRef = useRef(true);

    // همگام‌سازی اطلاعات اولیه دریافتی از Laravel
    useEffect(() => {
        setLiveMessages(messages);
    }, [messages]);

    useEffect(() => {
        setLiveStatus(conversation?.status ?? null);
    }, [conversation?.id, conversation?.status]);

    // دریافت پیام‌ها و وضعیت گفتگو هر ۲ ثانیه، بدون رفرش صفحه
    useEffect(() => {
        if (!currentUser || !conversation) return;

        let stopped = false;
        let inFlight = false;
        let controller: AbortController | null = null;

        const pollMessages = async () => {
            if (stopped || inFlight || document.hidden) return;

            inFlight = true;
            controller = new AbortController();

            try {
                const response = await fetch(
                    `/chat/${productId}/${conversation.id}/messages`,
                    {
                        method: 'GET',
                        credentials: 'same-origin',
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        console.error(
                            'دسترسی مشتری به پیام‌های گفتگو مجاز نیست.',
                            response.status,
                        );
                    } else {
                        console.error(
                            'دریافت پیام‌های گفتگو ناموفق بود:',
                            response.status,
                        );
                    }
                    return;
                }

                const data: PollResponse = await response.json();

                if (stopped) return;

                // جایگزینی لیست، نه افزودن مجدد پیام‌ها؛ بنابراین پیام تکراری نمی‌شود.
                if (Array.isArray(data.messages)) {
                    setLiveMessages((previous) => {
                        const previousLastId = previous.at(-1)?.id;
                        const incomingLastId = data.messages?.at(-1)?.id;

                        if (
                            previousLastId === incomingLastId &&
                            previous.length === data.messages!.length
                        ) {
                            return previous;
                        }

                        return data.messages!;
                    });
                }

                if (
                    data.conversation?.status === 'pending' ||
                    data.conversation?.status === 'open' ||
                    data.conversation?.status === 'close'
                ) {
                    setLiveStatus(data.conversation.status);
                }
            } catch (pollError) {
                if (
                    pollError instanceof Error &&
                    pollError.name !== 'AbortError'
                ) {
                    console.error('خطا در دریافت پیام‌های گفتگو:', pollError);
                }
            } finally {
                inFlight = false;
            }
        };

        void pollMessages();

        const timer = window.setInterval(() => {
            void pollMessages();
        }, 2000);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                void pollMessages();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopped = true;
            window.clearInterval(timer);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
            controller?.abort();
        };
    }, [productId, conversation?.id, currentUser?.id]);

    // اسکرول خودکار فقط زمانی که گفتگو باز است و مشتری نزدیک انتهای پیام‌هاست
    useEffect(() => {
        if (!expanded || !shouldScrollRef.current) return;

        bottomRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
    }, [expanded, liveMessages.length]);

    function handleMessagesScroll() {
        const container = messagesContainerRef.current;
        if (!container) return;

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        shouldScrollRef.current = distanceFromBottom < 100;
    }

    function createConversation() {
        if (!currentUser) {
            router.visit('/login');
            return;
        }

        setError('');

        router.post(
            `/chat/${productId}/new`,
            {},
            {
                preserveScroll: true,
                onError: () =>
                    setError('ایجاد گفت‌وگو انجام نشد. دوباره تلاش کن.'),
                onSuccess: () => setExpanded(true),
            },
        );
    }

    function sendMessage(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const text = body.trim();

        if (!text || !conversation || sending) return;

        if (String(liveStatus) === 'close') {
    setError('این گفت‌وگو بسته شده است.');
    return;
}

        setSending(true);
        setError('');

        router.post(
            `/chat/${productId}/${conversation.id}/send`,
            { body: text },
            {
                preserveScroll: true,
                onSuccess: () => setBody(''),
                onError: () =>
                    setError('ارسال پیام انجام نشد. دوباره تلاش کن.'),
                onFinish: () => setSending(false),
            },
        );
    }

    const statusText = conversation
        ? liveStatus === 'pending'
            ? 'در انتظار پاسخ مدیریت'
            : liveStatus === 'open'
              ? 'گفت‌وگو فعال است'
              : liveStatus === 'close'
                ? 'گفت‌وگو بسته شده'
                : 'در حال دریافت وضعیت گفتگو'
        : 'پاسخ‌گویی درباره همین محصول';

    return (
        <section
            dir="rtl"
            className="mt-6 overflow-hidden rounded-3xl border border-pine/15 bg-white shadow-lg shadow-pine/5"
        >
            <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-4 bg-pine px-5 py-4 text-right text-cream transition hover:bg-pine/95"
            >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cream/10 text-2xl">
                    💬
                </span>

                <span className="min-w-0 flex-1">
                    <span className="block font-extrabold">
                        گفت‌وگو درباره این محصول
                    </span>
                    <span className="mt-1 block text-sm text-cream/70">
                        {statusText}
                    </span>
                </span>

                <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-cream/10 transition-transform duration-300 ${
                        expanded ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                >
                    ↓
                </span>
            </button>

            <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    expanded
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="p-4 sm:p-5">
                        {!currentUser ? (
                            <div className="rounded-2xl bg-cream p-5 text-center">
                                <p className="font-bold text-pine">
                                    برای ارسال پیام ابتدا وارد حساب کاربری‌ات شو.
                                </p>
                                <a
                                    href="/login"
                                    className="mt-4 inline-flex rounded-xl bg-pine px-5 py-3 font-bold text-white transition hover:bg-pine/90"
                                >
                                    ورود به حساب
                                </a>
                            </div>
                        ) : !conversation ? (
                            <div className="py-4 text-center">
                                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-cream text-3xl">
                                    ✉️
                                </div>
                                <h3 className="mt-4 font-extrabold text-pine">
                                    سؤالی درباره این محصول داری؟
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-pine/65">
                                    گفت‌وگو را شروع کن تا مدیریت بتواند راهنمایی‌ات کند.
                                </p>
                                <button
                                    type="button"
                                    onClick={createConversation}
                                    className="mt-5 rounded-xl bg-pine px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-pine/90 active:translate-y-0"
                                >
                                    شروع گفت‌وگو
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-cream px-3 py-2 text-sm">
                                    <span className="font-bold text-pine">
                                        {liveStatus === 'pending'
                                            ? '⏳ منتظر پاسخ مدیریت'
                                            : liveStatus === 'open'
                                              ? '🟢 آماده گفت‌وگو'
                                              : liveStatus === 'close'
                                                ? '🔒 گفت‌وگو بسته است'
                                                : 'در حال دریافت وضعیت'}
                                    </span>
                                    <span className="text-pine/55">
                                        گفت‌وگوی شماره{' '}
                                        {conversation.id.toLocaleString('fa-IR')}
                                    </span>
                                </div>

                                <div
                                    ref={messagesContainerRef}
                                    onScroll={handleMessagesScroll}
                                    className="max-h-[380px] min-h-[180px] space-y-4 overflow-y-auto rounded-2xl bg-[#f6f5ef] p-3 sm:p-4"
                                    aria-live="polite"
                                >
                                    {liveMessages.length === 0 && (
                                        <p className="py-12 text-center text-sm text-pine/55">
                                            هنوز پیامی ارسال نشده؛ اولین پیام را بنویس.
                                        </p>
                                    )}

                                    {liveMessages.map((message) => {
                                        const mine =
                                            message.sender_id === currentUser.id &&
                                            (message.sender_type === 'user' ||
                                                message.sender_type?.endsWith(
                                                    '\\User',
                                                ));

                                        return (
                                            <div
                                                key={message.id}
                                                className={`animate-[chat-in_220ms_ease-out_both] flex ${
                                                    mine
                                                        ? 'justify-start'
                                                        : 'justify-end'
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
                                                        mine
                                                            ? 'rounded-tr-sm bg-pine text-white'
                                                            : 'rounded-tl-sm border border-pine/10 bg-white text-pine'
                                                    }`}
                                                >
                                                    <p className="whitespace-pre-wrap break-words text-sm leading-7">
                                                        {message.body}
                                                    </p>
                                                    <p
                                                        dir="rtl"
                                                        className={`mt-2 border-t pt-2 text-left text-[11px] ${
                                                            mine
                                                                ? 'border-white/15 text-white/65'
                                                                : 'border-pine/10 text-pine/50'
                                                        }`}
                                                    >
                                                        {formatDateTime(
                                                            message.created_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div ref={bottomRef} />
                                </div>

                                {liveStatus !== 'close' ? (
                                    <form onSubmit={sendMessage} className="mt-4">
                                        <label
                                            htmlFor={`chat-message-${productId}`}
                                            className="sr-only"
                                        >
                                            متن پیام
                                        </label>
                                        <div className="flex items-end gap-2 rounded-2xl border border-pine/15 bg-white p-2 transition focus-within:border-pine/50 focus-within:ring-2 focus-within:ring-pine/10">
                                            <textarea
                                                id={`chat-message-${productId}`}
                                                value={body}
                                                onChange={(event) =>
                                                    setBody(event.target.value)
                                                }
                                                placeholder="پیامت را اینجا بنویس..."
                                                rows={2}
                                                maxLength={5000}
                                                className="max-h-32 min-h-12 flex-1 resize-y border-0 bg-transparent px-3 py-2 text-sm text-pine outline-none ring-0 placeholder:text-pine/40 focus:border-0 focus:ring-0"
                                            />
                                            <button
                                                type="submit"
                                                disabled={
                                                            sending ||
                                                            !body.trim() ||
                                                            conversation?.status === 'close'
}
                                                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pine text-xl text-white transition hover:scale-105 hover:bg-pine/90 disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="ارسال پیام"
                                            >
                                                {sending ? '…' : '➤'}
                                            </button>

                                        </div>
                                        <p className="mt-2 text-left text-xs text-pine/45">
                                            {body.length.toLocaleString('fa-IR')} / ۵۰۰۰
                                        </p>
                                    </form>
                                ) : (
                                    <p className="mt-4 rounded-xl bg-cream p-3 text-center text-sm text-pine/65">
                                        این گفت‌وگو بسته شده و امکان ارسال پیام جدید وجود ندارد.
                                    </p>
                                )}
                            </>
                        )}

                        {error && (
                            <p
                                role="alert"
                                className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
                            >
                                {error}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes chat-in {
                    from { opacity: 0; transform: translateY(8px) scale(.985); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .animate-\\[chat-in_220ms_ease-out_both\\] { animation: none; }
                }
            `}</style>
        </section>
    );
}

