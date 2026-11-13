import type { CategoryId } from '../data/products';

// تا وقتی عکس واقعی نداریم، یک تصویر ساده‌ی برداری برای هر دسته نمایش داده می‌شه
export default function ProductArt({ category }: { category: CategoryId }) {
    return (
        <svg viewBox="0 0 200 200" className="relative h-full w-full" aria-hidden="true">
            <circle cx="100" cy="100" r="70" className="fill-cream" />

            {category === 'barberry' && (
                <>
                    <path d="M40 150 C 80 130, 120 90, 165 50" fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-pine" />
                    {[
                        [72, 118],
                        [106, 92],
                        [140, 66],
                    ].map(([x, y]) => (
                        <g key={x}>
                            <line x1={x} y1={y} x2={x} y2={y + 12} strokeWidth="2" className="stroke-pine" />
                            <ellipse cx={x - 6} cy={y + 22} rx="5" ry="8" className="fill-bordo" />
                            <ellipse cx={x + 6} cy={y + 22} rx="5" ry="8" className="fill-bordo" />
                            <ellipse cx={x} cy={y + 32} rx="5" ry="8" className="fill-bordo" />
                        </g>
                    ))}
                </>
            )}

            {category === 'rose' && (
                <>
                    {[0, 72, 144, 216, 288].map((angle) => (
                        <ellipse
                            key={angle}
                            cx="100"
                            cy="68"
                            rx="20"
                            ry="32"
                            transform={`rotate(${angle} 100 100)`}
                            className="fill-bordo"
                            opacity="0.9"
                        />
                    ))}
                    <circle cx="100" cy="100" r="14" className="fill-pine" />
                </>
            )}

            {category === 'saffron' && (
                <>
                    {[-18, 0, 18].map((angle) => (
                        <g key={angle} transform={`rotate(${angle} 100 150)`}>
                            <path d="M100 150 C 98 120, 104 96, 100 64" fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-bordo" />
                            <path d="M94 56 L106 56 L103 70 L97 70 Z" className="fill-bordo" />
                        </g>
                    ))}
                </>
            )}

            {category === 'other' && (
                <>
                    <rect x="78" y="62" width="44" height="12" rx="4" className="fill-pine" />
                    <path
                        d="M82 74 H118 V84 C 130 90, 134 100, 134 112 V142 C 134 150, 128 156, 120 156 H80 C 72 156, 66 150, 66 142 V112 C 66 100, 70 90, 82 84 Z"
                        className="fill-bordo"
                    />
                    <rect x="80" y="108" width="40" height="28" rx="4" className="fill-cream" />
                    <line x1="86" y1="118" x2="114" y2="118" strokeWidth="2" strokeLinecap="round" className="stroke-pine" />
                    <line x1="86" y1="126" x2="104" y2="126" strokeWidth="2" strokeLinecap="round" className="stroke-pine" />
                </>
            )}
        </svg>
    );
}
