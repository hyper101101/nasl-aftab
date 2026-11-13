import { categories, type Product } from '../data/products';

export type Filters = {
    q: string;
    grades: string[];
    varieties: string[];
    min: string;
    max: string;
};

export const emptyFilters: Filters = { q: '', grades: [], varieties: [], min: '', max: '' };

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

// تبدیل اعداد
export function toLatinDigits(value: string): string {
    return value
        .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

export function parsePrice(value: string): number | null {
    const digits = toLatinDigits(value).replace(/\D/g, '');
    return digits ? Number(digits) : null;
}

// یکسان‌سازی «ی» و «ک» عربی و فارسی و نیم‌فاصله برای جستجو
export function normalizeFa(value: string): string {
    return value
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک')
        .replace(/\u200c/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

// قیمت نهایی بعد از تخفیف تخفیف فقط وقتی اعمال می‌شه که پیشنهاد ویژه فعال باشه
export function finalPrice(p: Pick<Product, 'price' | 'special' | 'discount'>): number {
    const d = p.discount ?? 0;
    if (p.special && d > 0 && d < 100) {
        return Math.round((p.price * (100 - d)) / 100);
    }
    return p.price;
}

export function hasOffer(p: Pick<Product, 'price' | 'special' | 'discount'>): boolean {
    return finalPrice(p) < p.price;
}

export function activeFilterCount(f: Filters): number {
    const hasPrice = parsePrice(f.min) !== null || parsePrice(f.max) !== null;
    return f.grades.length + f.varieties.length + (f.q.trim() ? 1 : 0) + (hasPrice ? 1 : 0);
}

export function filterProducts(items: Product[], f: Filters): Product[] {
    const q = normalizeFa(f.q);
    const min = parsePrice(f.min) ?? 0;
    const max = parsePrice(f.max) ?? Number.POSITIVE_INFINITY;

    return items.filter((p) => {
        const text = normalizeFa([p.name, p.description, p.grade, p.variety].filter(Boolean).join(' '));
        const price = finalPrice(p);

        return (
            (!q || text.includes(q)) &&
            (f.grades.length === 0 || f.grades.includes(p.grade)) &&
            (f.varieties.length === 0 || (p.variety !== undefined && f.varieties.includes(p.variety))) &&
            price >= min &&
            price <= max
        );
    });
}
// آدرس صفحه‌ی محصول؛ مثلاً /products/zereshk/zereshk-anari-daraje-1
export function productUrl(p: Pick<Product, 'category' | 'slug'>): string {
    const slug = categories.find((c) => c.id === p.category)?.slug ?? 'other';
    return `/products/${slug}/${encodeURIComponent(p.slug)}`;
}
