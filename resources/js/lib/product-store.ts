import { useSyncExternalStore } from 'react';
import { products as seed, type CategoryId, type Product } from '../data/products';
import { toLatinDigits } from './catalog';

// فقط برای مرحله‌ی توسعه: داده توی localStorage همین مرورگر ذخیره می‌شه.
// بک‌اندکار همین توابع رو با درخواست به API (POST / PUT / DELETE) جایگزین می‌کنه.

const KEY = 'nasl-aftab:products:v1';

export type ProductInput = Omit<Product, 'id'>;
export type SaveResult = { ok: true } | { ok: false; error: string };

const FULL_MESSAGE =
    'ذخیره انجام نشد؛ احتمالاً حجم تصویرها از فضای مرورگر بیشتر شده. تصویر کوچک‌تری انتخاب کنید.';

const PREFIX: Record<CategoryId, string> = { barberry: 'ZR', rose: 'GM', zaferan: 'ZF', other: 'OT' };

// کد محصول: حروف انگلیسی بزرگ، عدد و خط تیره؛ ۲ تا ۲۰ نویسه
export const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{1,19}$/;

export function normalizeCode(value: string): string {
    return toLatinDigits(value).replace(/\s+/g, '').toUpperCase();
}

// کد پیشنهادی بعدی برای یک دسته؛ مثلاً اگه ZR-006 هست، ZR-007
export function nextProductCode(category: CategoryId, list: Product[]): string {
    const prefix = PREFIX[category];
    const pattern = new RegExp(`^${prefix}-(\\d+)$`);
    const used = new Set(list.map((p) => p.code));

    let max = 0;
    for (const p of list) {
        const match = p.code?.match(pattern);
        if (match) max = Math.max(max, Number(match[1]));
    }

    let n = max + 1;
    let code = '';
    do {
        code = `${prefix}-${String(n).padStart(3, '0')}`;
        n += 1;
    } while (used.has(code));

    return code;
}

// محصولاتی که قبلاً بدون کد ذخیره شده بودن، کد می‌گیرن
function ensureCodes(list: Array<Omit<Product, 'code'> & { code?: string }>): Product[] {
    const done: Product[] = list.filter((p): p is Product => Boolean(p.code));

    return list.map((p) => {
        if (p.code) return p as Product;
        const full: Product = { ...p, code: nextProductCode(p.category, done) };
        done.push(full);
        return full;
    });
}

const seedList: Product[] = seed.map((p) => ({ stock: 100, ...p }));

let cache: Product[] | null = null;
const listeners = new Set<() => void>();

function read(): Product[] {
    if (typeof window === 'undefined') return seedList;
    if (cache) return cache;
    try {
        const raw = window.localStorage.getItem(KEY);
        cache = raw ? ensureCodes(JSON.parse(raw)) : seedList;
    } catch {
        cache = seedList;
    }
    return cache;
}

function emit() {
    listeners.forEach((listener) => listener());
}

function commit(next: Product[]): boolean {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        return false;
    }
    cache = next;
    emit();
    return true;
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    // تغییر توی تب دیگه‌ی مرورگر
    const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) {
            cache = null;
            listener();
        }
    };
    window.addEventListener('storage', onStorage);

    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
    };
}

export function useProducts(): Product[] {
    return useSyncExternalStore(subscribe, read, () => seedList);
}

// id خالی یعنی محصول جدید
export function saveProduct(input: ProductInput, id?: number): SaveResult {
    const list = read();
    const code = normalizeCode(input.code);

    if (!CODE_PATTERN.test(code)) {
        return { ok: false, error: 'کد محصول معتبر نیست.' };
    }
    if (list.some((p) => p.code === code && p.id !== id)) {
        return { ok: false, error: 'این کد برای محصول دیگری ثبت شده است.' };
    }

    const data = { ...input, code };
    const next =
        id === undefined
            ? [...list, { ...data, id: Math.max(0, ...list.map((p) => p.id)) + 1 }]
            : list.map((p) => (p.id === id ? { ...data, id } : p));

    return commit(next) ? { ok: true } : { ok: false, error: FULL_MESSAGE };
}

export function updateProduct(id: number, patch: Partial<Product>): SaveResult {
    const next = read().map((p) => (p.id === id ? { ...p, ...patch } : p));
    return commit(next) ? { ok: true } : { ok: false, error: FULL_MESSAGE };
}

export function deleteProduct(id: number): SaveResult {
    return commit(read().filter((p) => p.id !== id)) ? { ok: true } : { ok: false, error: FULL_MESSAGE };
}

export function resetProducts() {
    try {
        window.localStorage.removeItem(KEY);
    } catch {
        // مهم نیست
    }
    cache = null;
    emit();
}
