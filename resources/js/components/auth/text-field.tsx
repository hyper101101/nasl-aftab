import { useState, type InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> & {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    ltr?: boolean; // برای شماره و رمز: راست‌چین نباشه
    revealable?: boolean; // دکمه‌ی نمایش/پنهان کردن رمز
};

const inputBase = [
    'w-full rounded-xl border border-pine/25 bg-pine/5 px-4 py-3 text-pine',
    'placeholder:text-pine/45 focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/30',
].join(' ');

const revealBtn = [
    'absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1',
    'text-xs font-bold hover:bg-pine/10',
].join(' ');

export default function TextField({ id, label, error, hint, ltr, revealable, type = 'text', ...rest }: Props) {
    const [shown, setShown] = useState(false);
    const isLtr = ltr || revealable;
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-bold">
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={revealable && shown ? 'text' : type}
                    dir={isLtr ? 'ltr' : undefined}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    className={`${inputBase} ${revealable ? 'pr-20' : ''}`}
                    {...rest}
                />
                {revealable && (
                    <button
                        type="button"
                        onClick={() => setShown(!shown)}
                        aria-pressed={shown}
                        className={revealBtn}
                    >
                        {shown ? 'پنهان' : 'نمایش'}
                    </button>
                )}
            </div>

            {hint && !error && (
                <p id={`${id}-hint`} className="mt-1 text-xs text-pine/65">
                    {hint}
                </p>
            )}
            {error && (
                <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-bold text-bordo">
                    {error}
                </p>
            )}
        </div>
    );
}
