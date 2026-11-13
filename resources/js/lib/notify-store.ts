import { toLatinDigits } from './catalog';
import { createLocalStore } from './local-store';

export type NotifyRequest = { productId: number; phone: string; createdAt: number };

const store = createLocalStore<NotifyRequest[]>('nasl-aftab:notify:v1', []);

export const useNotifyList = store.useStore;

// شماره‌ی موبایل ایران رو به شکل 09123456789 برمی‌گردونه؛ نامعتبر = null
export function normalizeMobile(value: string): string | null {
    const digits = toLatinDigits(value).replace(/\D/g, '');
    const match = digits.match(/^(?:0098|98|0)?(9\d{9})$/);
    return match ? `0${match[1]}` : null;
}

export function hasNotify(list: NotifyRequest[], productId: number): boolean {
    return list.some((r) => r.productId === productId);
}

export function addNotify(productId: number, phone: string): boolean {
    const list = store.read();
    if (list.some((r) => r.productId === productId && r.phone === phone)) return true;
    return store.write([...list, { productId, phone, createdAt: Date.now() }]);
}
