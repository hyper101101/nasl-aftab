import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import ShopLayout from '../../layouts/shop-layout';

type Props = {
    title: string;
    subtitle?: string;
    notice?: string;
    footer: ReactNode;
    children: ReactNode;
};

const card = [
    'on-cream mx-auto w-full max-w-md rounded-3xl bg-cream p-6 text-pine',
    'shadow-2xl sm:p-8',
].join(' ');

export default function AuthShell({ title, subtitle, notice, footer, children }: Props) {
    return (
        <ShopLayout>
            <Head title={`${title} | نسل آفتاب`}>
                <meta head-key="robots" name="robots" content="noindex, nofollow" />
            </Head>

            <section className="relative isolate overflow-hidden bg-pine px-4 pb-24 pt-32 md:pt-40">
                <div aria-hidden="true" className="absolute -end-24 top-10 -z-10 size-96 rounded-full bg-cream/10 blur-3xl" />
                <div aria-hidden="true" className="absolute -start-32 bottom-0 -z-10 size-80 rounded-full bg-bordo/50 blur-3xl" />

                <div className={card}>
                    <h1 className="text-2xl font-extrabold md:text-3xl">{title}</h1>
                    {subtitle && <p className="mt-2 leading-7 text-pine/75">{subtitle}</p>}

                    {notice && (
                        <p role="status" className="mt-5 rounded-xl bg-pine px-4 py-3 text-sm leading-7 text-cream">
                            {notice}
                        </p>
                    )}

                    <div className="mt-6">{children}</div>

                    <p className="mt-6 border-t border-pine/15 pt-5 text-center text-sm">{footer}</p>
                </div>
            </section>
        </ShopLayout>
    );
}
