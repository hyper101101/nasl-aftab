import { useEffect, useState } from 'react';
import { useShared } from '../lib/shared';

const wrap = 'pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4';

const base = 'rounded-2xl px-5 py-3 text-sm font-bold text-cream shadow-2xl ring-1 ring-cream/30';

// پیام‌های «موفق» و «خطا» که بک‌اند بعد از هر عملیات می‌فرسته (flash)
export default function FlashToast() {
    const { flash } = useShared();
    const [toast, setToast] = useState<{ text: string; error: boolean } | null>(null);

    useEffect(() => {
        const text = flash?.success ?? flash?.error;
        if (!text) return;

        setToast({ text, error: !flash?.success });
        const timer = window.setTimeout(() => setToast(null), 4000);
        return () => window.clearTimeout(timer);
    }, [flash]);

    return (
        <div role="status" aria-live="polite" className={wrap}>
            {toast && <p className={`${base} ${toast.error ? 'bg-bordo' : 'bg-pine'}`}>{toast.text}</p>}
        </div>
    );
}
