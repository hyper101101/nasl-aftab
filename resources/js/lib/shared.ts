import { usePage } from '@inertiajs/react';

// داده‌هایی که middleware بک‌اند (ShareShopData) برای همه‌ی صفحه‌ها می‌فرسته
export type SharedUser = {
    id: number;
    name: string;
    username: string;
    phone: string;
    signUpAt: string | null;
};

export type SharedProps = {
    auth: { user: SharedUser | null };
    cartCount: number;
    flash: { success?: string | null; error?: string | null; order?: string | null };
    errors: Record<string, string>;
    [key: string]: unknown;
};

export function useShared() {
    return usePage<SharedProps>().props;
}

export function useUser(): SharedUser | null {
    return useShared().auth?.user ?? null;
}
