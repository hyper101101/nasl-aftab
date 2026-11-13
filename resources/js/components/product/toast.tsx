const wrap = 'pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4';

const pill = [
    'rounded-2xl bg-pine px-5 py-3 text-sm font-bold text-cream',
    'shadow-2xl ring-1 ring-cream/30',
].join(' ');

// ناحیه‌ی aria-live همیشه وجود داره تا صفحه‌خوان پیام‌های تازه رو اعلام کنه
export default function Toast({ message }: { message: string }) {
    return (
        <div role="status" aria-live="polite" className={wrap}>
            {message && <p className={pill}>{message}</p>}
        </div>
    );
}
