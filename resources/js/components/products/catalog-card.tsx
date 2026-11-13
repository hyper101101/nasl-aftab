import { Link } from '@inertiajs/react';
import type { Product } from '../../data/products';
import { finalPrice, hasOffer, productUrl } from '../../lib/catalog';
import ProductArt from '../product-art';

const card = [
    'group flex h-full flex-col overflow-hidden rounded-3xl bg-pine text-cream',
    'shadow-xl shadow-pine/25 transition-transform duration-300 hover:-translate-y-1',
].join(' ');

const glow = [
    'absolute inset-0',
    'bg-[radial-gradient(circle_at_50%_55%,rgba(245,218,191,0.2),transparent_62%)]',
].join(' ');

const gradeBadge = [
    'pointer-events-none absolute start-4 top-4 inline-flex items-center gap-1.5',
    'rounded-full bg-cream px-3 py-1 text-xs font-extrabold text-pine',
].join(' ');

const badgeColumn = 'pointer-events-none absolute end-4 top-4 flex flex-col items-end gap-2';

const offerBadge = [
    'rounded-full bg-bordo px-3 py-1 text-xs font-extrabold text-cream',
    'ring-1 ring-cream/40',
].join(' ');

const wholesaleBadge = [
    'rounded-full bg-pine/80 px-3 py-1 text-xs font-bold text-cream',
    'ring-1 ring-cream/40',
].join(' ');

const soldOutLayer = [
    'pointer-events-none absolute inset-0 flex items-center justify-center bg-pine/70',
].join(' ');

const orderBtn = [
    'shrink-0 rounded-xl border border-cream/50 px-4 py-2 text-sm font-bold text-cream',
    'transition-colors hover:bg-cream hover:text-pine',
].join(' ');

export default function CatalogCard({ product }: { product: Product }) {
    const href = productUrl(product);
    const soldOut = (product.stock ?? 1) <= 0;
    const offer = hasOffer(product);
    const price = finalPrice(product);
    const action = soldOut ? 'مشاهده' : 'سفارش';

    return (
        <article className={card}>
            <div className="relative aspect-[4/3] overflow-hidden bg-pine">
                <div aria-hidden="true" className={glow} />

                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        width={400}
                        height={300}
                        loading="lazy"
                        draggable={false}
                        className="relative h-full w-full object-cover"
                    />
                ) : (
                    <ProductArt category={product.category} />
                )}

                {/* کل ناحیه‌ی عکس کلیک‌پذیره؛ برای کیبورد و صفحه‌خوان لینک اصلی همون نام محصوله */}
                <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0" />

                {soldOut && (
                    <div className={soldOutLayer}>
                        <span className="rounded-full bg-cream px-4 py-1.5 text-sm font-extrabold text-pine">
                            ناموجود
                        </span>
                    </div>
                )}

                <span className={gradeBadge}>
                    <svg viewBox="0 0 24 24" className="size-3.5 text-bordo" fill="currentColor" aria-hidden="true">
                        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
                    </svg>
                    {product.grade}
                </span>

                <div className={badgeColumn}>
                    {offer && <span className={offerBadge}>{(product.discount ?? 0).toLocaleString('fa-IR')}٪ تخفیف</span>}
                    {product.wholesale && <span className={wholesaleBadge}>عمده</span>}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold">
                    <Link href={href} className="hover:underline">
                        {product.name}
                    </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-cream/80">{product.description}</p>

                <div className="mt-5 flex items-end justify-between gap-3 border-t border-cream/15 pt-4">
                    <p className="font-bold">
                        {offer && (
                            <s className="block text-xs font-normal text-cream/60">
                                {product.price.toLocaleString('fa-IR')}
                            </s>
                        )}
                        {price.toLocaleString('fa-IR')}{' '}
                        <span className="text-sm font-normal text-cream/75">تومان</span>
                        <span className="block text-xs font-normal text-cream/75">{product.unit}</span>
                    </p>

                    <Link href={href} aria-label={`${action} ${product.name}`} className={orderBtn}>
                        {action}
                    </Link>
                </div>
            </div>
        </article>
    );
}
