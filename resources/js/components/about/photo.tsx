import { useState } from 'react';
import { LogoMark } from '../logo';

type Props = {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    eager?: boolean; // برای عکس‌های بالای صفحه
};

export default function Photo({ src, alt, width, height, className = '', eager = false }: Props) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div role="img" aria-label={alt} className={`flex items-center justify-center bg-pine ${className}`}>
                <LogoMark className="size-16 opacity-40" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailed(true)}
            className={`block object-cover ${className}`}
        />
    );
}
