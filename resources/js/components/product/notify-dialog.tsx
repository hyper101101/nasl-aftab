import { useEffect, useRef, useState, type FormEvent } from 'react';
import { normalizeMobile } from '../../lib/notify-store';

type Props = {
    productName: string;
    onClose: () => void;
    onSubmit: (phone: string) => void;
};

const dialogClass = [
    'on-cream m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-cream p-0 text-pine shadow-2xl',
    'backdrop:bg-pine/70 backdrop:backdrop-blur-sm',
].join(' ');

const inputClass = [
    'w-full rounded-xl border border-pine/25 bg-pine/5 px-4 py-2.5 text-pine',
    'placeholder:text-pine/45 focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/30',
].join(' ');

const submitBtn = [
    'rounded-xl bg-pine px-5 py-2.5 font-bold text-cream',
    'transition-colors hover:bg-pine/85',
].join(' ');

// این کامپوننت فقط وقتی لازمه mount می‌شه؛ پس هر بار با فرم خالی باز می‌شه
export default function NotifyDialog({ productName, onClose, onSubmit }: Props) {
    const ref = useRef<HTMLDialogElement>(null);
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const dialog = ref.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    // بستن از مسیر خود dialog تا فوکوس به دکمه‌ی قبلی برگرده
    const close = () => ref.current?.close();

    function submit(e: FormEvent) {
        e.preventDefault();
        const normalized = normalizeMobile(phone);
        if (!normalized) {
            setError('شماره‌ی موبایل معتبر نیست؛ مثلاً 09123456789');
            return;
        }
        onSubmit(normalized);
        close();
    }

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === ref.current) close();
            }}
            aria-labelledby="notify-title"
            className={dialogClass}
        >
            <form onSubmit={submit} noValidate className="p-6 sm:p-8">
                <h2 id="notify-title" className="text-xl font-extrabold">
                    اگر موجود شد خبرم کن
                </h2>
                <p className="mt-3 leading-8 text-pine/85">
                    شماره‌ی موبایل‌تان را وارد کنید تا هر وقت «{productName}» موجود شد پیامک بفرستیم.
                </p>

                <label htmlFor="notify-phone" className="mb-1.5 mt-5 block text-sm font-bold">
                    شماره‌ی موبایل
                </label>
                <input
                    id="notify-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? 'notify-error' : undefined}
                    placeholder="09123456789"
                    className={inputClass}
                />
                {error && (
                    <p id="notify-error" role="alert" className="mt-1.5 text-xs font-bold text-bordo">
                        {error}
                    </p>
                )}

                <div className="mt-7 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={close}
                        className="rounded-xl border border-pine/30 px-5 py-2.5 font-medium hover:bg-pine/10"
                    >
                        انصراف
                    </button>
                    <button type="submit" className={submitBtn}>
                        ثبت درخواست
                    </button>
                </div>
            </form>
        </dialog>
    );
}
