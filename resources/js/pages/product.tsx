
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ShopLayout from '../layouts/shop-layout';
import ProductArt from '../components/product-art';
import CatalogCard from '../components/products/catalog-card';
import { BellIcon, CartIcon, HeartIcon, ShareIcon } from '../components/product/icons';
import IconButton from '../components/product/icon-button';
import NotifyDialog from '../components/product/notify-dialog';
import QuantityStepper from '../components/product/quantity-stepper';
import Toast from '../components/product/toast';
import { categories, type Product } from '../data/products';
import { addToCart } from '../lib/cart-store';
import { finalPrice, hasOffer, productUrl } from '../lib/catalog';
import { toggleFavorite, useFavorites } from '../lib/favorites-store';
import { addNotify, hasNotify, useNotifyList } from '../lib/notify-store';
import { useProducts } from '../lib/product-store';
import {
    RatingLink,
    ReviewsSection,
    type Review,
    type ReviewSummary,
    type ReviewUser,
} from '../components/product/reviews-section';
import ProductChat from '../components/product/product-chat';

const panel = [
    'on-cream relative z-10 -mt-8 mb-12 rounded-[2.5rem] bg-cream',
    'pb-14 pt-8 text-pine md:pt-12',
].join(' ');

const mediaBox = [
    'relative aspect-square overflow-hidden rounded-3xl bg-pine',
    'shadow-xl shadow-pine/25',
].join(' ');

const glow = [
    'absolute inset-0',
    'bg-[radial-gradient(circle_at_50%_55%,rgba(245,218,191,0.2),transparent_62%)]',
].join(' ');

const gradeBadge = [
    'inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1',
    'text-xs font-extrabold text-pine',
].join(' ');

const offerBadge = [
    'rounded-full bg-bordo px-3 py-1 text-xs font-extrabold text-cream',
    'ring-1 ring-cream/40',
].join(' ');

const wholesaleBadge = [
    'rounded-full bg-pine/80 px-3 py-1 text-xs font-bold text-cream',
    'ring-1 ring-cream/40',
].join(' ');

const chip = [
    'inline-block rounded-full border border-pine/30 px-4 py-1 text-sm font-medium',
    'transition-colors hover:bg-pine hover:text-cream',
].join(' ');

const addBtn = [
    'flex flex-1 items-center justify-center gap-2 rounded-xl bg-pine px-6 py-3.5',
    'font-bold text-cream transition-colors hover:bg-pine/85',
].join(' ');

const disabledBtn = [
    'flex flex-1 cursor-not-allowed items-center justify-center rounded-xl',
    'bg-pine/25 px-6 py-3.5 font-bold text-pine/60',
].join(' ');

const notifyBtn = [
    'flex flex-1 items-center justify-center gap-2 rounded-xl border border-pine/40',
    'px-6 py-3.5 font-bold transition-colors hover:bg-pine hover:text-cream',
].join(' ');

type ProductChatConversation = {
    id: number;
    status: 'pending' | 'open' | 'close';
    product_id: number;
    last_message_at?: string | null;
};

type ProductChatMessage = {
    id: number;
    body: string;
    created_at: string | null;
    sender_type?: string;
    sender_id?: number;
};

function NotFound() {
    return (
        <ShopLayout>
            <Head title="محصول پیدا نشد | نسل آفتاب">
                <meta head-key="robots" name="robots" content="noindex" />
            </Head>

            <section className="bg-pine px-4 pb-28 pt-40 text-center">
                <h1 className="text-3xl font-extrabold md:text-4xl">
                    محصول پیدا نشد
                </h1>
                <p className="mx-auto mt-4 max-w-md leading-8 text-cream/80">
                    این محصول حذف شده یا آدرس آن درست نیست.
                </p>
                <Link
                    href="/products"
                    className="mt-8 inline-block rounded-xl bg-cream px-7 py-3.5 font-bold text-pine hover:bg-cream/85"
                >
                    مشاهده همه محصولات
                </Link>
            </section>
        </ShopLayout>
    );
}

function ProductDetail({
    product,
    reviews,
    reviewSummary,
    myReview,
    currentUser,
    conversation,
    messages,
}: {
    product: Product;
    reviews: Review[];
    reviewSummary: ReviewSummary;
    myReview: Review | null;
    currentUser: ReviewUser | null;
    conversation: ProductChatConversation | null;
    messages: ProductChatMessage[];
}) {
    const all = useProducts();
    const favorites = useFavorites();
    const notifications = useNotifyList();

    const [qty, setQty] = useState(1);
    const [notice, setNotice] = useState('');
    const [notifyOpen, setNotifyOpen] = useState(false);
    const timer = useRef(0);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const category =
        categories.find((c) => c.id === product.category) ?? categories[0];

    const stock = product.stock ?? 99;
    const soldOut = stock <= 0;
    const offer = hasOffer(product);
    const price = finalPrice(product);
    const isFavorite = favorites.includes(product.id);
    const alreadyNotify = hasNotify(notifications, product.id);

    const related = all
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 3);

    const path = productUrl(product);
    const url =
        typeof window === 'undefined'
            ? path
            : `${window.location.origin}${path}`;

    const metaDescription = [
        product.description,
        `قیمت: ${price.toLocaleString('fa-IR')} تومان (${product.unit}).`,
        'خرید مستقیم از کارخانه‌ی نسل آفتاب.',
    ].join(' ');

    const specs: Array<[string, string]> = [
        ['کد محصول', product.code],
        ['دسته‌بندی', category.label],
        ['درجه‌ی کیفیت', product.grade],
    ];

    if (product.variety) {
        specs.push(['نوع', product.variety]);
    }

    specs.push(
        ['واحد فروش', product.unit],
        ['نوع بسته‌بندی', product.wholesale ? 'عمده' : 'خانگی'],
        ['عرضه‌کننده', 'کارخانه‌ی نسل آفتاب، قائنات'],
    );

    function flash(message: string) {
        setNotice(message);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setNotice(''), 3500);
    }

    function onAddToCart() {
        const result = addToCart(product.id, qty, stock);

        if (!result.ok) {
            flash('افزودن به سبد انجام نشد.');
            return;
        }

        flash(
            result.capped
                ? `حداکثر موجودی (${stock.toLocaleString('fa-IR')} عدد) در سبد شما قرار گرفت.`
                : 'به سبد خرید اضافه شد.',
        );
    }

    function onFavorite() {
        const now = toggleFavorite(product.id);
        flash(
            now
                ? 'به علاقه‌مندی‌ها اضافه شد.'
                : 'از علاقه‌مندی‌ها حذف شد.',
        );
    }

    async function onShare() {
        const data = {
            title: product.name,
            text: `${product.name} | نسل آفتاب`,
            url,
        };

        try {
            if (typeof navigator.share === 'function') {
                await navigator.share(data);
                return;
            }

            await navigator.clipboard.writeText(url);
            flash('لینک محصول کپی شد.');
        } catch (error) {
            if (
                error instanceof DOMException &&
                error.name === 'AbortError'
            ) {
                return;
            }

            flash('اشتراک‌گذاری انجام نشد؛ لینک را از نوار آدرس کپی کنید.');
        }
    }

    function onNotify() {
        if (alreadyNotify) {
            flash(
                'درخواست شما قبلاً ثبت شده؛ پس از موجود شدن خبرتان می‌کنیم.',
            );
            return;
        }

        setNotifyOpen(true);
    }

    function submitNotify(phone: string) {
        const ok = addNotify(product.id, phone);

        flash(
            ok
                ? 'ثبت شد؛ به‌محض موجود شدن به شما اطلاع می‌دهیم.'
                : 'ثبت انجام نشد؛ دوباره تلاش کنید.',
        );
    }

    return (
        <ShopLayout>
            <Head title={`${product.name} | خرید از نسل آفتاب`}>
                <meta
                    head-key="description"
                    name="description"
                    content={metaDescription}
                />
                <link head-key="canonical" rel="canonical" href={url} />
                <meta head-key="og:type" property="og:type" content="product" />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content={product.name}
                />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={metaDescription}
                />
                <meta head-key="og:url" property="og:url" content={url} />
            </Head>

            <section className="bg-pine pb-14 pt-28 md:pt-32">
                <div className="mx-auto max-w-6xl px-4">
                    <nav
                        aria-label="مسیر صفحه"
                        className="text-sm text-cream/70"
                    >
                        <ol className="flex flex-wrap items-center gap-2">
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-cream hover:underline"
                                >
                                    خانه
                                </Link>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li>
                                <Link
                                    href="/products"
                                    className="hover:text-cream hover:underline"
                                >
                                    محصولات
                                </Link>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li>
                                <Link
                                    href={`/products/${category.slug}`}
                                    className="hover:text-cream hover:underline"
                                >
                                    {category.label}
                                </Link>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li aria-current="page" className="text-cream">
                                {product.name}
                            </li>
                        </ol>
                    </nav>
                </div>
            </section>

            <div className={panel}>
                <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 px-4 lg:grid-cols-2 lg:gap-14">
                    {/* ستون اول: تصویر محصول و کارت گفت‌وگو */}
                    <div className="min-w-0 space-y-4">
                        <div className={mediaBox}>
                            <div aria-hidden="true" className={glow} />

                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    width={800}
                                    height={800}
                                    draggable={false}
                                    className="relative size-full object-cover"
                                />
                            ) : (
                                <ProductArt category={product.category} />
                            )}

                            {soldOut && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-pine/60">
                                    <span className="rounded-full bg-cream px-5 py-2 font-extrabold text-pine">
                                        ناموجود
                                    </span>
                                </div>
                            )}

                            <div className="absolute end-4 top-4 flex flex-col items-end gap-2">
                                <span className={gradeBadge}>
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="size-3.5 text-bordo"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
                                    </svg>
                                    {product.grade}
                                </span>

                                {offer && (
                                    <span className={offerBadge}>
                                        {(product.discount ?? 0).toLocaleString('fa-IR')}
                                        ٪ تخفیف
                                    </span>
                                )}

                                {product.wholesale && (
                                    <span className={wholesaleBadge}>
                                        عمده
                                    </span>
                                )}
                            </div>

                            <div className="absolute start-4 top-4 z-10 flex flex-col gap-2">
                                <IconButton
                                    label="اشتراک‌گذاری"
                                    onClick={() => void onShare()}
                                >
                                    <ShareIcon />
                                </IconButton>

                                <IconButton
                                    label={
                                        isFavorite
                                            ? 'حذف از علاقه‌مندی‌ها'
                                            : 'افزودن به علاقه‌مندی‌ها'
                                    }
                                    pressed={isFavorite}
                                    onClick={onFavorite}
                                >
                                    <HeartIcon filled={isFavorite} />
                                </IconButton>

                                {soldOut && (
                                    <IconButton
                                        label={
                                            alreadyNotify
                                                ? 'درخواست اطلاع‌رسانی ثبت شده'
                                                : 'اگر موجود شد خبرم کن'
                                        }
                                        pressed={alreadyNotify}
                                        onClick={onNotify}
                                    >
                                        <BellIcon />
                                    </IconButton>
                                )}
                            </div>
                        </div>

                        {/* کارت چت دقیقاً زیر تصویر قرار می‌گیرد */}
                        <div className="min-w-0 w-full">
                            <ProductChat
                                productId={product.id}
                                currentUser={currentUser}
                                conversation={conversation}
                                messages={messages}
                            />
                        </div>
                    </div>

                    {/* ستون دوم: مشخصات محصول */}
                    <div className="min-w-0">
                        <Link
                            href={`/products/${category.slug}`}
                            className={chip}
                        >
                            {category.label}
                        </Link>

                        <h1 className="mt-4 text-3xl font-extrabold leading-[1.5] md:text-4xl">
                            {product.name}
                        </h1>

                        <RatingLink summary={reviewSummary} />

                        <div className="mt-6 rounded-2xl bg-pine p-5 text-cream">
                            {offer && (
                                <p className="flex items-center gap-3">
                                    <s className="text-sm text-cream/60">
                                        {product.price.toLocaleString('fa-IR')}
                                    </s>
                                    <span className="rounded-full bg-bordo px-2.5 py-0.5 text-xs font-extrabold ring-1 ring-cream/40">
                                        {(product.discount ?? 0).toLocaleString('fa-IR')}
                                        ٪ تخفیف
                                    </span>
                                </p>
                            )}

                            <p className="mt-1 text-3xl font-extrabold">
                                {price.toLocaleString('fa-IR')}{' '}
                                <span className="text-base font-normal text-cream/75">
                                    تومان
                                </span>
                            </p>

                            <p className="mt-1 text-sm text-cream/75">
                                {product.unit}
                            </p>
                        </div>

                        <p className="mt-4 flex items-center gap-2 text-sm">
                            <span
                                aria-hidden="true"
                                className={`size-2.5 rounded-full ${
                                    soldOut || stock <= 5
                                        ? 'bg-bordo'
                                        : 'bg-pine'
                                }`}
                            />

                            {soldOut && (
                                <span className="font-bold text-bordo">
                                    ناموجود
                                </span>
                            )}

                            {!soldOut && stock <= 5 && (
                                <span className="font-bold text-bordo">
                                    تنها {stock.toLocaleString('fa-IR')} عدد
                                    باقی مانده
                                </span>
                            )}

                            {!soldOut && stock > 5 && (
                                <span className="font-bold">
                                    موجود در انبار
                                </span>
                            )}
                        </p>

                        <h2 className="mt-8 text-lg font-extrabold">
                            توضیحات
                        </h2>
                        <p className="mt-2 leading-8 text-pine/85">
                            {product.description}
                        </p>

                        <h2 className="mt-8 text-lg font-extrabold">
                            مشخصات محصول
                        </h2>

                        <dl className="mt-3 divide-y divide-pine/15 rounded-2xl border border-pine/15">
                            {specs.map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex justify-between gap-4 px-4 py-3 text-sm"
                                >
                                    <dt className="text-pine/70">{label}</dt>
                                    <dd className="font-bold">{value}</dd>
                                </div>
                            ))}
                        </dl>

                        {/* خرید */}
                        <div className="mt-8 rounded-2xl border border-pine/15 bg-pine/5 p-4">
                            {soldOut ? (
                                <div className="flex flex-wrap gap-3">
                                    <span
                                        aria-disabled="true"
                                        className={disabledBtn}
                                    >
                                        ناموجود
                                    </span>

                                    <button
                                        type="button"
                                        onClick={onNotify}
                                        className={notifyBtn}
                                    >
                                        <BellIcon />
                                        {alreadyNotify
                                            ? 'درخواست ثبت شد'
                                            : 'اگر موجود شد خبرم کن'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center gap-3">
                                    <QuantityStepper
                                        value={qty}
                                        max={stock}
                                        onChange={setQty}
                                    />

                                    <button
                                        type="button"
                                        onClick={onAddToCart}
                                        className={addBtn}
                                    >
                                        <CartIcon />
                                        افزودن به سبد خرید
                                    </button>
                                </div>
                            )}

                            <p className="mt-4 text-sm leading-7 text-pine/75">
                                خرید عمده یا سؤال درباره‌ی محصول؟ با مدیریت
                                تماس بگیرید:{' '}
                                <a
                                    href="tel:+989155623845"
                                    dir="ltr"
                                    className="inline-block font-bold hover:underline"
                                >
                                    0915 562 3845
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                <ReviewsSection
                    product={product}
                    reviews={reviews}
                    summary={reviewSummary}
                    myReview={myReview}
                    currentUser={currentUser}
                />

                {related.length > 0 && (
                    <section
                        aria-labelledby="related-title"
                        className="mx-auto mt-16 max-w-6xl px-4"
                    >
                        <div className="flex items-end justify-between gap-4">
                            <h2
                                id="related-title"
                                className="text-2xl font-extrabold"
                            >
                                محصولات مشابه
                            </h2>

                            <Link
                                href={`/products/${category.slug}`}
                                className="font-bold text-bordo underline underline-offset-8 hover:text-pine"
                            >
                                همه‌ی {category.label} ←
                            </Link>
                        </div>

                        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((p) => (
                                <li key={p.id}>
                                    <CatalogCard product={p} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>

            <Toast message={notice} />

            {notifyOpen && (
                <NotifyDialog
                    productName={product.name}
                    onClose={() => setNotifyOpen(false)}
                    onSubmit={submitNotify}
                />
            )}
        </ShopLayout>
    );
}

export default function ProductPage({
    product,
    reviews = [],
    reviewSummary,
    myReview = null,
    currentUser = null,
    conversation = null,
    messages = [],
}: {
    category: string;
    product: Product;
    isFavorite: boolean;
    reviews?: Review[];
    reviewSummary: ReviewSummary;
    myReview?: Review | null;
    currentUser?: ReviewUser | null;
    conversation?: ProductChatConversation | null;
    messages?: ProductChatMessage[];
}) {
    if (!product) {
        return <NotFound />;
    }

    const safeSummary: ReviewSummary = reviewSummary ?? {
        count: 0,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    return (
        <ProductDetail
            key={product.id}
            product={product}
            reviews={reviews}
            reviewSummary={safeSummary}
            myReview={myReview}
            currentUser={currentUser}
            conversation={conversation}
            messages={messages}
        />
    );
}
