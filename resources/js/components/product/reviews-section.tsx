import { Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import type { Product } from '../../data/products';
import { authUrl } from '../../lib/auth-redirect';
import { productUrl } from '../../lib/catalog';
import {
    COMMENT_MAX,
    COMMENT_MIN,
} from '../../lib/reviews-store';
import ConfirmDialog from '../admin/confirm-dialog';
import { StarInput, Stars } from './star-rating';

export type Review = {
    id: number;
    userId: number;
    rating: number;
    comment: string;
    author: string;
    createdAt: string | number;
    status?: string;
};

export type ReviewSummary = {
    count: number;
    average: number;
    distribution: Record<number, number>;
};

export type ReviewUser = {
    id: number;
    name: string;
};


const PAGE_SIZE = 5;

const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

const fmt = (n: number) => n.toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const textareaClass = [
    'w-full rounded-xl border border-pine/25 bg-cream px-4 py-3 text-pine',
    'placeholder:text-pine/45 focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/30',
].join(' ');

const primaryBtn = [
    'rounded-xl bg-pine px-6 py-3 font-bold text-cream transition-colors hover:bg-pine/85',
].join(' ');

const outlineBtn = [
    'rounded-xl border border-pine/30 px-6 py-3 font-bold transition-colors',
    'hover:bg-pine hover:text-cream',
].join(' ');

const dangerBtn = [
    'rounded-xl border border-bordo/40 px-5 py-3 text-sm font-bold text-bordo',
    'transition-colors hover:bg-bordo hover:text-cream',
].join(' ');

// خلاصه‌ی امتیاز کنار نام محصول؛ با کلیک به بخش نظرات می‌ره
export function RatingLink({ summary }: { summary: ReviewSummary }) {

    return (
        <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm hover:underline">
            {summary.count > 0 ? (
                <>
                    <Stars value={summary.average} size="size-4" />
                    <span className="font-bold">{fmt(summary.average)}</span>
                    <span className="text-pine/70">({summary.count.toLocaleString('fa-IR')} نظر)</span>
                </>
            ) : (
                <span className="text-pine/70">هنوز نظری ثبت نشده؛ اولین نفر باشید</span>
            )}
        </a>
    );
}


function ReviewForm({
    user,
    product,
    existing,
}: {
    user: ReviewUser;
    product: Product;
    existing?: Review;
}) {
    const [rating, setRating] = useState(existing?.rating ?? 0);
    const [comment, setComment] = useState(existing?.comment ?? '');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [notice, setNotice] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    function submit(e: FormEvent) {
        e.preventDefault();
        setErrors({});
        setNotice('');

        if (rating < 1 || rating > 5) {
            setErrors({ rating: 'لطفاً امتیاز محصول را انتخاب کنید.' });
            return;
        }

        if (comment.trim().length < COMMENT_MIN) {
            setErrors({
                comment: `متن نظر باید حداقل ${COMMENT_MIN} کاراکتر باشد.`,
            });
            return;
        }

        if (comment.length > COMMENT_MAX) {
            setErrors({
                comment: `متن نظر نباید بیشتر از ${COMMENT_MAX} کاراکتر باشد.`,
            });
            return;
        }

        setProcessing(true);

        const options = {
            preserveScroll: true,
            onError: (serverErrors: Record<string, string>) => {
                setErrors({
                    ...serverErrors,
                    ...(serverErrors.body
                        ? { comment: serverErrors.body }
                        : {}),
                    ...(serverErrors.product_id
                        ? { form: serverErrors.product_id }
                        : {}),
                });
            },
            onSuccess: () => {
                setNotice(
                    existing
                        ? 'نظر شما ویرایش شد و پس از تأیید مدیر نمایش داده می‌شود.'
                        : 'نظر شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود.',
                );
            },
            onFinish: () => setProcessing(false),
        };

        if (existing) {
            router.put(
                `/comment/edit/${existing.id}`,
                { rating, body: comment.trim() },
                options,
            );
        } else {
            router.post(
                '/comment/new',
                {
                    product_id: product.id,
                    rating,
                    body: comment.trim(),
                },
                options,
            );
        }
    }

    function confirmDelete() {
        if (!existing) {
            setConfirmOpen(false);
            return;
        }

        setProcessing(true);

        router.delete(`/comment/delete/${existing.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmOpen(false);
                setNotice('نظر شما حذف شد.');
                setRating(0);
                setComment('');
                setErrors({});
            },
            onError: (serverErrors) => {
                setErrors({
                    form: Object.values(serverErrors).join(' '),
                });
                setConfirmOpen(false);
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <form
                onSubmit={submit}
                noValidate
                className="rounded-2xl border border-pine/15 bg-pine/5 p-5"
            >
                <h3 className="text-lg font-extrabold">
                    {existing
                        ? 'نظر شما درباره‌ی این محصول'
                        : 'نظر خود را بنویسید'}
                </h3>

                {existing?.status === 'pending' && (
                    <p className="mt-3 rounded-xl bg-pine/10 px-4 py-3 text-sm">
                        نظر شما در انتظار تأیید مدیر است.
                    </p>
                )}

                {errors.form && (
                    <p
                        role="alert"
                        className="mt-3 rounded-xl bg-bordo px-4 py-3 text-sm font-bold text-cream"
                    >
                        {errors.form}
                    </p>
                )}

                {errors.comment && !errors.form && (
                    <p
                        role="alert"
                        className="mt-3 rounded-xl bg-bordo px-4 py-3 text-sm font-bold text-cream"
                    >
                        {errors.comment}
                    </p>
                )}

                <div className="mt-4">
                    <StarInput
                        name={`rating-${product.id}`}
                        value={rating}
                        onChange={setRating}
                        describedBy={
                            errors.rating ? 'review-rating-error' : undefined
                        }
                    />
                    {errors.rating && (
                        <p
                            id="review-rating-error"
                            role="alert"
                            className="mt-1 text-xs font-bold text-bordo"
                        >
                            {errors.rating}
                        </p>
                    )}
                </div>

                <label
                    htmlFor={`review-comment-${product.id}`}
                    className="mb-1.5 mt-4 block text-sm font-bold"
                >
                    متن نظر
                </label>

                <textarea
                    id={`review-comment-${product.id}`}
                    rows={4}
                    maxLength={COMMENT_MAX}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    aria-invalid={errors.comment ? true : undefined}
                    aria-describedby={
                        errors.comment ? 'review-comment-error' : undefined
                    }
                    placeholder="کیفیت، بسته‌بندی و تجربه‌ی خودتان را بنویسید..."
                    className={textareaClass}
                />

                <p className="mt-1 flex justify-between text-xs text-pine/65">
                    <span>
                        حداقل {COMMENT_MIN.toLocaleString('fa-IR')} کاراکتر
                    </span>
                    <span>
                        {comment.length.toLocaleString('fa-IR')} /{' '}
                        {COMMENT_MAX.toLocaleString('fa-IR')}
                    </span>
                </p>

                {errors.comment && (
                    <p
                        id="review-comment-error"
                        role="alert"
                        className="mt-1 text-xs font-bold text-bordo"
                    >
                        {errors.comment}
                    </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className={primaryBtn}
                    >
                        {processing
                            ? 'لطفاً صبر کنید...'
                            : existing
                              ? 'ذخیره‌ی تغییرات'
                              : 'ثبت نظر'}
                    </button>

                    {existing && (
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => setConfirmOpen(true)}
                            className={dangerBtn}
                        >
                            حذف نظر
                        </button>
                    )}
                </div>

                <p
                    role="status"
                    aria-live="polite"
                    className="mt-3 min-h-5 text-sm font-bold"
                >
                    {notice}
                </p>
            </form>

            <ConfirmDialog
                open={confirmOpen}
                title="حذف نظر"
                message="نظر شما برای همیشه حذف می‌شود. ادامه می‌دهید؟"
                confirmLabel="بله، حذف شود"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
}

export function ReviewsSection({
    product,
    reviews,
    summary,
    myReview,
    currentUser,
}: {
    product: Product;
    reviews: Review[];
    summary: ReviewSummary;
    myReview: Review | null;
    currentUser: ReviewUser | null;
}) {
    const [visible, setVisible] = useState(PAGE_SIZE);
    const back = `${productUrl(product)}#reviews`;

    return (
        <section
            id="reviews"
            aria-labelledby="reviews-title"
            className="mx-auto mt-16 max-w-6xl px-4"
        >
            <h2
                id="reviews-title"
                className="text-2xl font-extrabold"
            >
                نظرات کاربران
            </h2>

            <div className="mt-6 grid gap-8 lg:grid-cols-[18rem_1fr]">
                <aside
                    aria-label="خلاصه‌ی امتیازها"
                    className="h-fit rounded-2xl bg-pine p-5 text-cream"
                >
                    {summary.count > 0 ? (
                        <>
                            <p className="text-5xl font-extrabold">
                                {fmt(summary.average)}
                                <span className="ms-1 text-lg font-normal text-cream/70">
                                    از ۵
                                </span>
                            </p>

                            <div className="mt-2">
                                <Stars
                                    value={summary.average}
                                    tone="onPine"
                                />
                            </div>

                            <p className="mt-2 text-sm text-cream/75">
                                بر اساس{' '}
                                {summary.count.toLocaleString('fa-IR')} نظر
                            </p>

                            <dl className="mt-5 space-y-2">
                                {[5, 4, 3, 2, 1].map((n) => {
                                    const count =
                                        summary.distribution[n] ?? 0;
                                    const percent =
                                        (count / summary.count) * 100;

                                    return (
                                        <div
                                            key={n}
                                            className="flex items-center gap-3 text-sm"
                                        >
                                            <dt className="w-16 shrink-0">
                                                {n.toLocaleString('fa-IR')}{' '}
                                                ستاره
                                            </dt>
                                            <dd className="flex flex-1 items-center gap-3">
                                                <span
                                                    aria-hidden="true"
                                                    className="h-2 flex-1 overflow-hidden rounded-full bg-cream/15"
                                                >
                                                    <span
                                                        className="block h-full rounded-full bg-cream"
                                                        style={{
                                                            width: `${percent}%`,
                                                        }}
                                                    />
                                                </span>
                                                <span className="w-6 text-end text-cream/75">
                                                    {count.toLocaleString('fa-IR')}
                                                </span>
                                            </dd>
                                        </div>
                                    );
                                })}
                            </dl>
                        </>
                    ) : (
                        <p className="leading-8 text-cream/85">
                            هنوز نظری برای این محصول ثبت نشده است.
                        </p>
                    )}
                </aside>

                <div className="space-y-6">
                    {currentUser ? (
                        <ReviewForm
                            key={`${currentUser.id}-${product.id}`}
                            user={currentUser}
                            product={product}
                            existing={myReview ?? undefined}
                        />
                    ) : (
                        <div className="rounded-2xl border border-dashed border-pine/30 p-5">
                            <p className="font-bold">
                                برای ثبت نظر ابتدا وارد حساب خود شوید.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-3">
                                <Link
                                    href={authUrl('login', back)}
                                    className={primaryBtn}
                                >
                                    ورود
                                </Link>
                                <Link
                                    href={authUrl('register', back)}
                                    className={outlineBtn}
                                >
                                    ثبت‌نام
                                </Link>
                            </div>
                        </div>
                    )}

                    {reviews.length > 0 && (
                        <>
                            <ul className="space-y-4">
                                {reviews.slice(0, visible).map((review) => (
                                    <li
                                        key={review.id}
                                        className="rounded-2xl border border-pine/15 p-5"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Stars
                                                    value={review.rating}
                                                    size="size-4"
                                                />
                                                <span className="font-bold">
                                                    {review.author}
                                                </span>
                                                {currentUser?.id === review.userId && (
                                                    <span className="rounded-full bg-pine px-2 py-0.5 text-xs text-cream">
                                                        نظر شما
                                                    </span>
                                                )}
                                            </div>

                                            <time
                                                dateTime={new Date(
                                                    review.createdAt,
                                                ).toISOString()}
                                                className="text-xs text-pine/65"
                                            >
                                                {new Date(
                                                    review.createdAt,
                                                ).toLocaleDateString(
                                                    'fa-IR',
                                                    dateOptions,
                                                )}
                                            </time>
                                        </div>

                                        <p className="mt-3 whitespace-pre-line break-words leading-8 text-pine/90">
                                            {review.comment}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            {reviews.length > visible && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setVisible(visible + PAGE_SIZE)
                                    }
                                    className={outlineBtn}
                                >
                                    نمایش نظرهای بیشتر
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
