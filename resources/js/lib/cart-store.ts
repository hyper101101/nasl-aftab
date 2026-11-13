import { createLocalStore } from './local-store';

// فقط شناسه و تعداد ذخیره می‌شه؛ قیمت همیشه از خود محصول خونده می‌شه
export type CartItem = { productId: number; qty: number };

const store = createLocalStore<CartItem[]>('nasl-aftab:cart:v1', []);

export const useCart = store.useStore;

export function cartCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.qty, 0);
}

// capped یعنی تعداد درخواستی از موجودی بیشتر بود و به سقف رسید
export function addToCart(productId: number, qty: number, max: number): { ok: boolean; capped: boolean } {
    if (max <= 0 || qty <= 0) return { ok: false, capped: false };

    const items = store.read();
    const current = items.find((i) => i.productId === productId)?.qty ?? 0;
    const wanted = current + qty;
    const nextQty = Math.min(wanted, max);

    const next = current
        ? items.map((i) => (i.productId === productId ? { ...i, qty: nextQty } : i))
        : [...items, { productId, qty: nextQty }];

    return { ok: store.write(next), capped: wanted > max };
}

export function setCartQty(productId: number, qty: number, max: number): boolean {
    const safe = Math.max(1, Math.min(qty, Math.max(max, 1)));
    return store.write(store.read().map((i) => (i.productId === productId ? { ...i, qty: safe } : i)));
}

export function removeFromCart(productId: number): boolean {
    return store.write(store.read().filter((i) => i.productId !== productId));
}

export function clearCart(): boolean {
    return store.write([]);
}
