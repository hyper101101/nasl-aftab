import { createLocalStore } from './local-store';

const store = createLocalStore<number[]>('nasl-aftab:favorites:v1', []);

export const useFavorites = store.useStore;

// خروجی: بعد از این کار، محصول توی علاقه‌مندی‌هاست یا نه
export function toggleFavorite(productId: number): boolean {
    const list = store.read();
    const exists = list.includes(productId);
    const ok = store.write(exists ? list.filter((id) => id !== productId) : [...list, productId]);
    return ok ? !exists : exists;
}
