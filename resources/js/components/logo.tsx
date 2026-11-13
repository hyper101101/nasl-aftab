type LogoProps = {
    tagline?: boolean;
    className?: string;
};

export function LogoMark({
    className = 'size-10',
}: {
    className?: string;
}) {
    return (
        <img
            src="/images/nasl-aftab-logo.jpg"
            alt=""
            aria-hidden="true"
            className={`${className} shrink-0 rounded-full object-contain`}
        />
    );
}

export default function Logo({
    tagline = false,
    className = 'size-10',
}: LogoProps) {
    return (
        <span className="flex items-center gap-2.5">
            <LogoMark className={className} />

            <span className="flex flex-col leading-none">
                <span className="text-xl font-extrabold">
                    نسل آفتاب
                </span>

                {tagline && (
                    <span className="mt-1.5 text-[11px] font-medium text-cream/70">
                        کارخانه مکانیزه بوجاری زرشک
                    </span>
                )}
            </span>
        </span>
    );
}
