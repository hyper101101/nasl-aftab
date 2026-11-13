import { Head, Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Logo from '../components/logo';

export default function AdminLayout({ title, children }: PropsWithChildren<{ title: string }>) {
    return (
        <div className="on-cream min-h-screen bg-cream text-pine">
            <Head title={`${title} | پنل مدیریت`}>
                <meta head-key="robots" name="robots" content="noindex, nofollow" />
            </Head>

            <header className="bg-pine text-cream">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
                    <div className="flex items-center gap-4">
                        <Logo />
                        <span className="rounded-full bg-cream/10 px-3 py-1 text-sm">پنل مدیریت</span>
                    </div>
                    <Link href="/" className="text-sm text-cream/80 hover:text-cream hover:underline">
                        مشاهده سایت
                    </Link>
                </div>
            </header>

            <main>{children}</main>
        </div>
    );
}
