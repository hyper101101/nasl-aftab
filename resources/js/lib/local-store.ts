import { useSyncExternalStore } from 'react';

// ساخت یک ذخیره‌گاه کوچیک روی localStorage (فقط برای مرحله‌ی توسعه)
// بک‌اندکار بعداً توابع هر ذخیره‌گاه رو با درخواست به API عوض می‌کنه
export function createLocalStore<T>(key: string, initial: T) {
    let cache: T | null = null;
    const listeners = new Set<() => void>();

    function read(): T {
        if (typeof window === 'undefined') return initial;
        if (cache !== null) return cache;

        let value = initial;
        try {
            const raw = window.localStorage.getItem(key);
            if (raw) value = JSON.parse(raw) as T;
        } catch {
            value = initial;
        }
        cache = value;
        return value;
    }

    function emit() {
        listeners.forEach((listener) => listener());
    }

    function write(next: T): boolean {
        try {
            window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
            return false;
        }
        cache = next;
        emit();
        return true;
    }

    // تغییر توی تب دیگه‌ی مرورگر
    function onStorage(e: StorageEvent) {
        if (e.key === key) {
            cache = null;
            emit();
        }
    }

    function subscribe(listener: () => void) {
        if (listeners.size === 0) window.addEventListener('storage', onStorage);
        listeners.add(listener);

        return () => {
            listeners.delete(listener);
            if (listeners.size === 0) window.removeEventListener('storage', onStorage);
        };
    }

    function useStore(): T {
        return useSyncExternalStore(subscribe, read, () => initial);
    }

    return { read, write, useStore };
}
