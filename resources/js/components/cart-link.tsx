import { Link } from '@inertiajs/react';
import { cartCount, useCart } from '../lib/cart-store';
import { CartIcon } from './product/icons';

const linkClass = [
    'relative rounded-lg p-2 text-cream/80 transition-colors',
    'hover:bg-cream/10 hover:text-cream',
].join(' ');

const badge = [
    'absolute -end-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full',
    'bg-bordo px-1 text-xs font-bold text-cream ring-1 ring-cream/40',
].join(' ');

export default function CartLink() {
    const count = cartCount(useCart());
    const label = count > 0 ? `سبد خرید، ${count.toLocaleString('fa-IR')} کالا` : 'سبد خرید';

    return (
        <Link href="/cart" aria-label={label} className={linkClass}>
            <CartIcon className="size-6" />
            {count > 0 && <span className={badge}>{count.toLocaleString('fa-IR')}</span>}
        </Link>
    );
}
