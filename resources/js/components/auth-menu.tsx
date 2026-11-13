import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { authUrl, safeNext } from '../lib/auth-redirect';
import { logoutUser, useCurrentUser } from '../lib/auth-store';

function UserIcon({ className = 'size-6' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
        </svg>
    );
}

const loginLink = [
    'hidden rounded-xl px-4 py-2 text-sm font-medium text-cream/85',
    'transition-colors hover:bg-cream/10 hover:text-cream sm:block',
].join(' ');

const registerLink = [
    'hidden rounded-xl bg-cream px-4 py-2 text-sm font-bold text-pine',
    'transition-colors hover:bg-cream/85 sm:block',
].join(' ');

const iconLink = 'rounded-lg p-2 text-cream/80 hover:bg-cream/10 hover:text-cream sm:hidden';

const avatarBtn = [
    'flex items-center gap-2 rounded-full bg-cream/10 py-1 pe-3 ps-1 text-cream',
    'transition-colors hover:bg-cream/20',
].join(' ');

const menuBox = [
    'glass absolute end-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl',
    'bg-pine/95 p-2 text-cream',
].join(' ');

const menuItem = 'block w-full rounded-lg px-3 py-2.5 text-start text-sm hover:bg-cream/10';

export default function AuthMenu() {
    const user = useCurrentUser();
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    const wrapper = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);

    // بستن منو با کلیک بیرون و کلید Esc
    useEffect(() => {
        if (!open) return;

        const onPointer = (e: PointerEvent) => {
            if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                trigger.current?.focus();
            }
        };

        document.addEventListener('pointerdown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    if (!user) {
        const next = safeNext(url);
        return (
            <div className="flex items-center gap-1.5">
                <Link href={authUrl('login', next)} className={loginLink}>
                    ورود
                </Link>
                <Link href={authUrl('register', next)} className={registerLink}>
                    ثبت‌نام
                </Link>
                <Link href={authUrl('login', next)} aria-label="ورود یا ثبت‌نام" className={iconLink}>
                    <UserIcon />
                </Link>
            </div>
        );
    }

    const initial = Array.from(user.name.trim())[0] ?? '؟';
    const firstName = user.name.split(' ')[0];

    function onLogout() {
    setOpen(false);
    logoutUser();
}

    return (
        <div ref={wrapper} className="relative">
            <button
                ref={trigger}
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls="user-menu"
                aria-label={`منوی کاربر، ${user.name}`}
                className={avatarBtn}
            >
                <span className="flex size-8 items-center justify-center rounded-full bg-cream text-sm font-extrabold text-pine">
                    {initial}
                </span>
                <span className="hidden max-w-24 truncate text-sm font-medium sm:block">{firstName}</span>
            </button>

            {open && (
                <div id="user-menu" className={menuBox}>
                    <div className="border-b border-cream/15 px-3 pb-3 pt-2">
                        <p className="truncate font-bold">{user.name}</p>
                        <p dir="ltr" className="text-start text-xs text-cream/70">
                            {user.mobile}
                        </p>
                    </div>

                    <div className="pt-2">
                        <Link href="/profile" onClick={() => setOpen(false)} className={menuItem}>
                            پروفایل من
                        </Link>
                        <a href="/profile#orders" className={menuItem}>
                            سفارش‌های من
                        </a>
                        <button type="button" onClick={onLogout} className={menuItem}>
                            خروج
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
