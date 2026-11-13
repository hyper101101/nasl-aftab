type IconProps = { className?: string };

const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
};

export function HeartIcon({ className = 'size-5', filled = false }: IconProps & { filled?: boolean }) {
    return (
        <svg {...common} className={className} fill={filled ? 'currentColor' : 'none'}>
            <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.4 2.7 5 6.1 5c2.1 0 3.6 1.1 5.9 3.4C14.3 6.1 15.8 5 17.9 5c3.4 0 5.2 3.4 3.7 6.7C19.5 16.4 12 21 12 21z" />
        </svg>
    );
}

export function BellIcon({ className = 'size-5' }: IconProps) {
    return (
        <svg {...common} className={className}>
            <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7zM10 20a2 2 0 0 0 4 0" />
        </svg>
    );
}

export function ShareIcon({ className = 'size-5' }: IconProps) {
    return (
        <svg {...common} className={className}>
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
        </svg>
    );
}

export function CartIcon({ className = 'size-5' }: IconProps) {
    return (
        <svg {...common} className={className}>
            <path d="M3 4h2.2l2.2 10.5a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L19.5 8H6.1" />
            <circle cx="9.5" cy="19.5" r="1.3" />
            <circle cx="16.5" cy="19.5" r="1.3" />
        </svg>
    );
}
