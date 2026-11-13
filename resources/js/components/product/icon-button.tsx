import type { ReactNode } from 'react';

type Props = {
    label: string;
    onClick: () => void;
    pressed?: boolean; // برای دکمه‌های روشن/خاموش مثل علاقه‌مندی
    children: ReactNode;
};

const base = [
    'glass flex size-11 items-center justify-center rounded-full text-cream',
    'transition-colors focus-visible:ring-2 focus-visible:ring-cream',
].join(' ');

const idle = 'bg-pine/65 hover:bg-cream hover:text-pine';
const active = 'bg-bordo hover:bg-bordo/85';

export default function IconButton({ label, onClick, pressed, children }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            aria-pressed={pressed}
            className={`${base} ${pressed ? active : idle}`}
        >
            {children}
        </button>
    );
}
