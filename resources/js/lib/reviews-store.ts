import { useMemo } from 'react';
import type { User } from './auth-store';
import { createLocalStore } from './local-store';

// فقط برای مرحله‌ی توسعه (localStorage)؛ بک‌اندکار با API جایگزین می‌کنه.
// هر کاربر برای هر محصول فقط یک نظر داره.

export type Review = {
    id: number;
    productId: number;
    userId: number;
    author: string; // نام کوتاه‌شده برای نمایش عمومی
    rating: number; // ۱ تا ۵
    comment: string;
    createdAt: number;
    updatedAt?: number;
};

export type ReviewResult = { ok: true } | { ok: false; field?: 'rating' | 'comment'; error: string };

export const COMMENT_MIN = 10;
export const COMMENT_MAX = 600;

const store = createLocalStore<Review[]>('nasl-aftab:reviews:v1', []);

export const useReviews = store.useStore;

// «محمد حسین یعقوبی» می‌شه «محمد ی.»
export function authorLabel(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) return parts[0] ?? '';
    return `${parts[0]} ${Array.from(parts[parts.length - 1])[0]}.`;
}

export function saveReview(
    user: Pick<User, 'id' | 'name'>,
    productId: number,
    rating: number,
    comment: string,
): ReviewResult {
    const text = comment.trim().replace(/\n{3,}/g, '\n\n');

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return { ok: false, field: 'rating', error: 'امتیاز را با انتخاب ستاره مشخص کنید.' };
    }
    if (text.length < COMMENT_MIN) {
        return {
            ok: false,
            field: 'comment',
            error: `نظر باید حداقل ${COMMENT_MIN.toLocaleString('fa-IR')} کاراکتر باشد.`,
        };
    }
    if (text.length > COMMENT_MAX) {
        return {
            ok: false,
            field: 'comment',
            error: `نظر نباید بیشتر از ${COMMENT_MAX.toLocaleString('fa-IR')} کاراکتر باشد.`,
        };
    }

    const list = store.read();
    const existing = list.find((r) => r.productId === productId && r.userId === user.id);
    const now = Date.now();
    const author = authorLabel(user.name);

    const next = existing
        ? list.map((r) => (r === existing ? { ...r, rating, comment: text, author, updatedAt: now } : r))
        : [
              ...list,
              {
                  id: Math.max(0, ...list.map((r) => r.id)) + 1,
                  productId,
                  userId: user.id,
                  author,
                  rating,
                  comment: text,
                  createdAt: now,
              },
          ];

    return store.write(next) ? { ok: true } : { ok: false, error: 'ثبت نظر انجام نشد؛ دوباره تلاش کنید.' };
}

// کاربر فقط نظر خودش رو می‌تونه حذف کنه
export function deleteReview(id: number, userId: number): boolean {
    return store.write(store.read().filter((r) => !(r.id === id && r.userId === userId)));
}

export type ReviewSummary = {
    count: number;
    average: number;
    distribution: Record<number, number>;
};

export function summarize(list: Review[]): ReviewSummary {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    for (const r of list) {
        distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
        sum += r.rating;
    }

    return { count: list.length, average: list.length ? sum / list.length : 0, distribution };
}

export function useProductReviews(productId: number) {
    const all = useReviews();

    return useMemo(() => {
        const list = all.filter((r) => r.productId === productId).sort((a, b) => b.createdAt - a.createdAt);
        return { list, summary: summarize(list) };
    }, [all, productId]);
}
