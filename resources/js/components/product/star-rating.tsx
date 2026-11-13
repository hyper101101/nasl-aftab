import { useState } from 'react';

const STAR = 'M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z';
const LABELS = ['خیلی بد', 'بد', 'متوسط', 'خوب', 'عالی'];

function Star({ className }: { className: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d={STAR} />
        </svg>
    );
}

type StarsProps = {
    value: number; // ۰ تا ۵؛ اعشار هم قبوله (مثلاً ۴٫۳)
    size?: string;
    tone?: 'onCream' | 'onPine'; // روی زمینه‌ی کرم یا سبز
};

// نمایش ستاره‌ها؛ بخش پر شده از سمت شروع (راست در فارسی) پر می‌شه
export function Stars({ value, size = 'size-5', tone = 'onCream' }: StarsProps) {
    const filled = tone === 'onCream' ? 'text-bordo' : 'text-cream';
    const empty = tone === 'onCream' ? 'text-pine/25' : 'text-cream/25';
    const percent = Math.max(0, Math.min(100, (value / 5) * 100));

    const row = (color: string) => (
        <span className="flex w-max gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`${size} ${color}`} />
            ))}
        </span>
    );

    return (
        <span
            role="img"
            aria-label={`امتیاز ${value.toLocaleString('fa-IR', { maximumFractionDigits: 1 })} از ۵`}
            className="relative inline-flex"
        >
            {row(empty)}
            <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${percent}%` }}>
                {row(filled)}
            </span>
        </span>
    );
}

type InputProps = {
    name: string;
    value: number;
    onChange: (value: number) => void;
    describedBy?: string;
};

// انتخاب ستاره؛ با ماوس، لمس و کیبورد (کلیدهای جهت) کار می‌کنه
export function StarInput({ name, value, onChange, describedBy }: InputProps) {
    const [hover, setHover] = useState(0);
    const shown = hover || value;

    return (
        <fieldset onMouseLeave={() => setHover(0)}>
            <legend className="mb-1.5 text-sm font-bold">امتیاز شما</legend>

            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                    <label
                        key={n}
                        onMouseEnter={() => setHover(n)}
                        className="cursor-pointer rounded-lg p-1 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-pine"
                    >
                        <input
                            type="radio"
                            name={name}
                            value={n}
                            checked={value === n}
                            onChange={() => onChange(n)}
                            aria-describedby={describedBy}
                            className="sr-only"
                        />
                        <span className="sr-only">
                            {n.toLocaleString('fa-IR')} از ۵ ({LABELS[n - 1]})
                        </span>
                        <Star className={`size-8 transition-colors ${n <= shown ? 'text-bordo' : 'text-pine/25'}`} />
                    </label>
                ))}

                <span aria-hidden="true" className="ms-2 text-sm font-bold">
                    {shown ? LABELS[shown - 1] : ''}
                </span>
            </div>
        </fieldset>
    );
}
