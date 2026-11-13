import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import ShopLayout from '../layouts/shop-layout';
import { authUrl } from '../lib/auth-redirect';
import { logoutUser, useCurrentUser } from '../lib/auth-store';
import { useOrders } from '../lib/orders-store';

const panel = [
    'on-cream relative z-10 -mt-8 mb-12 rounded-[2.5rem] bg-cream',
    'pb-14 pt-10 text-pine md:pt-12',
].join(' ');

const logoutBtn = [
    'rounded-xl border border-pine/30 px-5 py-2.5 text-sm font-bold',
    'transition-colors hover:bg-pine hover:text-cream',
].join(' ');

const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

export default function Profile() {
    const user = useCurrentUser();
    const orders = useOrders();

    const mine = useMemo(
        () => orders.filter((o) => o.userId === user?.id).sort((a, b) => b.createdAt - a.createdAt),
        [orders, user?.id],
    );

    // کاربر وارد نشده؟ به صفحه‌ی ورود می‌ره و بعد از ورود برمی‌گرده
    useEffect(() => {
        if (!user) router.visit(authUrl('login', '/profile'), { replace: true });
    }, [user]);

    if (!user) return null;

    const initial = Array.from(user.name.trim())[0] ?? '؟';

    function onLogout() {
        logoutUser();
        router.visit('/');
    }

    return (
        <ShopLayout>
            <Head title="پروفایل من | نسل آفتاب">
                <meta head-key="robots" name="robots" content="noindex, nofollow" />
            </Head>

            <section className="bg-pine pb-14 pt-28 md:pt-32">
                <div className="mx-auto max-w-6xl px-4">
                    <h1 className="text-4xl font-extrabold md:text-5xl">پروفایل من</h1>
                </div>
            </section>

            <div className={panel}>
                <div className="mx-auto max-w-6xl space-y-10 px-4">
                    <section aria-labelledby="info-title" className="flex flex-wrap items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <span className="flex size-16 items-center justify-center rounded-full bg-pine text-2xl font-extrabold text-cream">
                                {initial}
                            </span>
                            <div>
                                <h2 id="info-title" className="text-xl font-extrabold">
                                    {user.name}
                                </h2>
                                <p dir="ltr" className="text-start text-pine/75">
                                    {user.mobile}
                                </p>
                                <p className="text-sm text-pine/65">
                                    عضو از {new Date(user.createdAt).toLocaleDateString('fa-IR', dateOptions)}
                                </p>
                            </div>
                        </div>

                        <button type="button" onClick={onLogout} className={logoutBtn}>
                            خروج از حساب
                        </button>
                    </section>

                    <section id="orders" aria-labelledby="orders-title" className="scroll-mt-28">
                        <h2 id="orders-title" className="text-2xl font-extrabold">
                            سفارش‌های من
                        </h2>

                        {mine.length === 0 ? (
                            <p className="mt-4 rounded-2xl border border-dashed border-pine/30 p-8 text-center text-pine/75">
                                هنوز سفارشی ثبت نکرده‌اید.
                            </p>
                        ) : (
                            <ul className="mt-5 space-y-4">
                                {mine.map((order) => (
                                    <li key={order.id} className="rounded-2xl border border-pine/15 bg-pine/5 p-5">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p dir="ltr" className="text-start text-lg font-extrabold">
                                                    {order.number}
                                                </p>
                                                <p className="text-sm text-pine/70">
                                                    {new Date(order.createdAt).toLocaleDateString('fa-IR', dateOptions)}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-pine px-3 py-1 text-xs font-bold text-cream">
                                                در انتظار بررسی
                                            </span>
                                        </div>

                                        <ul className="mt-4 divide-y divide-pine/10 text-sm">
                                            {order.lines.map((line) => (
                                                <li key={line.productId} className="flex justify-between gap-4 py-2">
                                                    <span>
                                                        {line.name}
                                                        <span dir="ltr" className="ms-2 inline-block font-mono text-xs text-pine/65">
                                                            {line.code}
                                                        </span>
                                                        <span className="block text-xs text-pine/65">
                                                            {line.qty.toLocaleString('fa-IR')} × {line.unit}
                                                        </span>
                                                    </span>
                                                    <span className="shrink-0 font-bold">
                                                        {(line.unitPrice * line.qty).toLocaleString('fa-IR')}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <p className="mt-3 flex justify-between border-t border-pine/15 pt-3 font-extrabold">
                                            <span>جمع کل</span>
                                            <span>{order.total.toLocaleString('fa-IR')} تومان</span>
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </ShopLayout>
    );
}
