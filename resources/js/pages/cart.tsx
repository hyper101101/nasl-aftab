import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ShopLayout from '../layouts/shop-layout';
import ProductArt from '../components/product-art';
import QuantityStepper from '../components/product/quantity-stepper';
import type { Product } from '../data/products';
import { authUrl } from '../lib/auth-redirect';
import { useCurrentUser } from '../lib/auth-store';
import { clearCart, removeFromCart, setCartQty, useCart, type CartItem } from '../lib/cart-store';
import { finalPrice, hasOffer, productUrl } from '../lib/catalog';
import { placeOrder, type Order, type OrderLine } from '../lib/orders-store';


type Line = {
    item: CartItem;
    product?: Product; // خالی یعنی محصول از سایت حذف شده
    stock: number;
    qty: number;
    ok: boolean; // محصول وجود داره و موجوده
};

const panel = [
    'on-cream relative z-10 -mt-8 mb-12 rounded-[2.5rem] bg-cream',
    'pb-14 pt-10 text-pine md:pt-12',
].join(' ');

const lineBox = 'flex gap-4 rounded-2xl border border-pine/15 bg-pine/5 p-4';

const summaryBox = 'h-fit rounded-2xl bg-pine p-5 text-cream lg:sticky lg:top-28';

const checkoutBtn = [
    'mt-5 w-full rounded-xl bg-cream py-3.5 font-bold text-pine',
    'transition-colors hover:bg-cream/85',
].join(' ');

const removeBtn = [
    'rounded-lg border border-bordo/40 px-3 py-2 text-sm font-bold text-bordo',
    'transition-colors hover:bg-bordo hover:text-cream',
].join(' ');

const primaryLink = [
    'inline-block rounded-xl bg-pine px-7 py-3.5 font-bold text-cream',
    'transition-colors hover:bg-pine/85',
].join(' ');

export default function Cart({
    databaseProducts,
}: {
    databaseProducts: Product[];
}) {
    const items = useCart();
    const products = databaseProducts;
    const user = useCurrentUser();

    const [placed, setPlaced] = useState<Order | null>(null);
    const [error, setError] = useState('');

    const lines: Line[] = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const stock = product?.stock ?? 99;
        const ok = Boolean(product) && stock > 0;
        return { item, product, stock, ok, qty: ok ? Math.min(item.qty, stock) : item.qty };
    });

    const hasProblem = lines.some((l) => !l.ok);
    const payable = lines.filter((l) => l.ok);
    const totalCount = payable.reduce((sum, l) => sum + l.qty, 0);
    const total = payable.reduce((sum, l) => sum + (l.product ? finalPrice(l.product) * l.qty : 0), 0);

    function onCheckout() {
        setError('');

        // کاربر وارد نشده؟ اول باید وارد بشه یا ثبت‌نام کنه، بعد به همین صفحه برمی‌گرده
        if (!user) {
            router.visit(authUrl('login', '/cart', 'checkout'));
            return;
        }

        if (hasProblem) {
            setError('چند کالا دیگر موجود نیستند؛ ابتدا آن‌ها را از سبد حذف کنید.');
            return;
        }

        const orderLines: OrderLine[] = [];
        for (const l of lines) {
            if (!l.product) continue;
            orderLines.push({
                productId: l.product.id,
                code: l.product.code,
                name: l.product.name,
                unit: l.product.unit,
                qty: l.qty,
                unitPrice: finalPrice(l.product),
            });
        }

        const order = placeOrder(user.id, orderLines);
        if (!order) {
            setError('ثبت سفارش انجام نشد؛ دوباره تلاش کنید.');
            return;
        }

        clearCart();
        setPlaced(order);
    }

    return (
        <ShopLayout>
            <Head title="سبد خرید | نسل آفتاب">
                <meta head-key="robots" name="robots" content="noindex, nofollow" />
            </Head>

            <section className="bg-pine pb-14 pt-28 md:pt-32">
                <div className="mx-auto max-w-6xl px-4">
                    <h1 className="text-4xl font-extrabold md:text-5xl">سبد خرید</h1>
                </div>
            </section>

            <div className={panel}>
                <div className="mx-auto max-w-6xl px-4">
                    {placed ? (
                        <div className="mx-auto max-w-lg rounded-3xl bg-pine p-8 text-center text-cream">
                            <h2 className="text-2xl font-extrabold">سفارش شما ثبت شد</h2>
                            <p className="mt-4 text-cream/80">شماره‌ی سفارش</p>
                            <p dir="ltr" className="mt-1 text-3xl font-extrabold">
                                {placed.number}
                            </p>
                            <p className="mt-4 leading-8 text-cream/80">
                                وضعیت سفارش را از پروفایل خود پیگیری کنید. برای هماهنگی با مدیریت هم می‌توانید تماس
                                بگیرید: <span dir="ltr" className="inline-block font-bold">0915 562 3845</span>
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <a href="/profile#orders" className="rounded-xl bg-cream px-6 py-3 font-bold text-pine hover:bg-cream/85">
                                    پیگیری سفارش
                                </a>
                                <Link href="/products" className="rounded-xl border border-cream/40 px-6 py-3 font-medium hover:bg-cream/10">
                                    ادامه‌ی خرید
                                </Link>
                            </div>
                        </div>
                    ) : lines.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-pine/30 p-12 text-center">
                            <p className="text-xl font-bold">سبد خرید شما خالی است</p>
                            <p className="mt-2 text-pine/75">محصولات را ببینید و به سبد اضافه کنید.</p>
                            <Link href="/products" className={`mt-6 ${primaryLink}`}>
                                مشاهده محصولات
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
                            <ul className="space-y-4">
                                {lines.map(({ item, product, stock, qty, ok }) => (
                                    <li key={item.productId} className={lineBox}>
                                        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-pine sm:size-24">
                                            {product?.image ? (
                                                <img
                                                    src={product.image}
                                                    alt=""
                                                    width={96}
                                                    height={96}
                                                    className="size-full object-cover"
                                                />
                                            ) : product ? (
                                                <ProductArt category={product.category} />
                                            ) : null}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            {product ? (
                                                <>
                                                    <h2 className="font-bold">
                                                        <Link href={productUrl(product)} className="hover:underline">
                                                            {product.name}
                                                        </Link>
                                                    </h2>
                                                    <p className="mt-0.5 text-xs text-pine/70">
                                                        کد:{' '}
                                                        <span dir="ltr" className="inline-block font-mono font-bold">
                                                            {product.code}
                                                        </span>
                                                        {' · '}
                                                        {product.unit}
                                                    </p>
                                                    <p className="mt-2 text-sm font-bold">
                                                        {hasOffer(product) && (
                                                            <s className="me-2 font-normal text-pine/55">
                                                                {product.price.toLocaleString('fa-IR')}
                                                            </s>
                                                        )}
                                                        {finalPrice(product).toLocaleString('fa-IR')} تومان
                                                    </p>
                                                </>
                                            ) : (
                                                <h2 className="font-bold text-bordo">این محصول دیگر در سایت نیست</h2>
                                            )}

                                            {product && !ok && (
                                                <p className="mt-2 text-sm font-bold text-bordo">این محصول ناموجود شده است.</p>
                                            )}
                                            {ok && item.qty > stock && (
                                                <p className="mt-2 text-xs font-bold text-bordo">
                                                    موجودی کم شد؛ تعداد به {stock.toLocaleString('fa-IR')} عدد تغییر کرد.
                                                </p>
                                            )}

                                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                                {ok && product ? (
                                                    <>
                                                        <QuantityStepper
                                                            value={qty}
                                                            max={stock}
                                                            onChange={(v) => setCartQty(item.productId, v, stock)}
                                                        />
                                                        <p className="font-extrabold">
                                                            {(finalPrice(product) * qty).toLocaleString('fa-IR')}{' '}
                                                            <span className="text-sm font-normal">تومان</span>
                                                        </p>
                                                    </>
                                                ) : (
                                                    <span />
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.productId)}
                                                    aria-label={`حذف ${product?.name ?? 'کالا'} از سبد`}
                                                    className={removeBtn}
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <aside aria-label="خلاصه‌ی سفارش" className={summaryBox}>
                                <h2 className="text-lg font-extrabold">خلاصه‌ی سفارش</h2>

                                <dl className="mt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-cream/75">تعداد اقلام</dt>
                                        <dd className="font-bold">{totalCount.toLocaleString('fa-IR')}</dd>
                                    </div>
                                    <div className="flex items-end justify-between border-t border-cream/15 pt-3">
                                        <dt className="text-cream/75">جمع کل</dt>
                                        <dd className="text-xl font-extrabold">
                                            {total.toLocaleString('fa-IR')}{' '}
                                            <span className="text-sm font-normal">تومان</span>
                                        </dd>
                                    </div>
                                </dl>

                                {!user && (
                                    <p className="mt-4 rounded-xl bg-cream/10 p-3 text-sm leading-7">
                                        برای ثبت سفارش باید وارد حساب کاربری شوید. اگر حساب ندارید، ثبت‌نام کنید.
                                    </p>
                                )}

                                {error && (
                                    <p role="alert" className="mt-4 rounded-xl bg-bordo p-3 text-sm font-bold">
                                        {error}
                                    </p>
                                )}

                                <button type="button" onClick={onCheckout} className={checkoutBtn}>
                                    {user ? 'ثبت سفارش' : 'ورود و ثبت سفارش'}
                                </button>

                                {!user && (
                                    <Link
                                        href={authUrl('register', '/cart', 'checkout')}
                                        className="mt-3 block text-center text-sm font-bold underline underline-offset-4"
                                    >
                                        حساب ندارم؛ ثبت‌نام
                                    </Link>
                                )}
                            </aside>
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}
