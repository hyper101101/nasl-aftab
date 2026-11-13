import { createLocalStore } from './local-store';

// قیمت‌ها و کد محصول لحظه‌ی ثبت توی سفارش ذخیره می‌شه، تا بعداً با تغییر محصول عوض نشه
export type OrderLine = {
    productId: number;
    code: string;
    name: string;
    unit: string;
    qty: number;
    unitPrice: number; // قیمت واحد بعد از تخفیف
};

export type Order = {
    id: number;
    number: string;
    userId: number;
    lines: OrderLine[];
    total: number;
    createdAt: number;
    status: 'pending';
};

const store = createLocalStore<Order[]>('nasl-aftab:orders:v1', []);

export const useOrders = store.useStore;

// بک‌اندکار شماره‌ی سفارش، کم‌کردن موجودی و قیمت‌ها رو سمت سرور حساب می‌کنه
export function placeOrder(userId: number, lines: OrderLine[]): Order | null {
    if (lines.length === 0) return null;

    const list = store.read();
    const id = Math.max(0, ...list.map((o) => o.id)) + 1;
    const order: Order = {
        id,
        number: `NA-${String(id).padStart(5, '0')}`,
        userId,
        lines,
        total: lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0),
        createdAt: Date.now(),
        status: 'pending',
    };

    return store.write([...list, order]) ? order : null;
}
