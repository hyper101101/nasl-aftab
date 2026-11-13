import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AuthMenu from './auth-menu';
import CartLink from './cart-link';
import Logo from './logo';
import { authUrl, safeNext } from '../lib/auth-redirect';
import { logoutUser, useCurrentUser } from '../lib/auth-store';

const links = [
    { href: '/', label: 'خانه' },
    { href: '/products', label: 'محصولات' },
     { href: '/about', label: 'درباره‌ی ما' },
    { href: '/#contact', label: 'تماس با ما' },
    { href: '/blog', label: 'مقالات وبلاگ' },
];

const bar = [
    'glass mx-auto flex h-14 max-w-6xl items-center justify-between',
    'rounded-2xl bg-pine/85 px-4 text-cream',
].join(' ');

const navLink = [
    'rounded-lg px-4 py-2 text-cream/80 transition-colors',
    'hover:bg-cream/10 hover:text-cream',
].join(' ');

const callBtn = [
    'hidden rounded-xl bg-bordo px-4 py-2 text-sm font-bold text-cream ring-1 ring-cream/25',
    'transition-colors hover:bg-cream hover:text-pine lg:block',
].join(' ');

const mobileItem = 'block w-full rounded-lg px-4 py-3 text-start text-cream/80 hover:bg-cream/10 hover:text-cream';

export default function Header() {
    const [open, setOpen] = useState(false);
    const user = useCurrentUser();
    const { url } = usePage();
    const next = safeNext(url);

    function close() {
        setOpen(false);
    }

    function onLogout() {
    close();
    logoutUser();
}

    return (
        <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6">
            <div className={bar}>
                <a href="/" aria-label="از نسل آفتاب، صفحه‌ی اصلی">
                    <Logo />
                </a>

                <nav aria-label="منوی اصلی" className="hidden items-center gap-1 md:flex">
                    {links.map((link) => (
                        <a key={link.href} href={link.href} className={navLink}>
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-1.5">
                    <CartLink />
                    <AuthMenu />
                    <a href="tel:+989155623845" className={callBtn}>
                        سفارش تلفنی
                    </a>
                    <button
                        type="button"
                        className="rounded-lg p-2 text-cream/80 hover:bg-cream/10 md:hidden"
                        aria-expanded={open}
                        aria-controls="mobile-nav"
                        aria-label="باز و بسته کردن منو"
                        onClick={() => setOpen(!open)}
                    >
                        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                        </svg>
                    </button>
                </div>
            </div>

            {open && (
                <nav
                    id="mobile-nav"
                    aria-label="منوی اصلی"
                    className="glass mx-auto mt-2 max-w-6xl rounded-2xl bg-pine/95 p-2 text-cream md:hidden"
                >
                    <ul>
                        {links.map((link) => (
                            <li key={link.href}>
                                <a href={link.href} onClick={close} className={mobileItem}>
                                    {link.label}
                                </a>
                            </li>
                        ))}

                        <li className="my-1 border-t border-cream/15" aria-hidden="true" />

                        {user ? (
                            <>
                                <li>
                                    <Link href="/profile" onClick={close} className={mobileItem}>
                                        پروفایل من
                                    </Link>
                                </li>
                                <li>
                                    <button type="button" onClick={onLogout} className={mobileItem}>
                                        خروج
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link href={authUrl('login', next)} onClick={close} className={mobileItem}>
                                        ورود
                                    </Link>
                                </li>
                                <li>
                                    <Link href={authUrl('register', next)} onClick={close} className={mobileItem}>
                                        ثبت‌نام
                                    </Link>
                                </li>
                            </>
                        )}

                        <li className="p-2">
                            <a
                                href="tel:+989155623845"
                                className="block rounded-xl bg-bordo py-3 text-center font-bold text-cream ring-1 ring-cream/25"
                            >
                                سفارش تلفنی
                            </a>
                        </li>
                    </ul>
                </nav>
            )}
        </header>
    );
}
