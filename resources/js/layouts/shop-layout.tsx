import type { PropsWithChildren } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

const skipLink = [
    'sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50',
    'focus:rounded focus:bg-cream focus:px-4 focus:py-2 focus:text-pine',
].join(' ');

export default function ShopLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-pine text-cream">
            <a href="#main" className={skipLink}>
                رفتن به محتوای اصلی
            </a>
            <Header />
            <main id="main" className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
