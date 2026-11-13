import { router, usePage } from '@inertiajs/react';
import { normalizeMobile } from './notify-store';

export type User = {
    id: number;
    name: string;
    mobile: string;
    createdAt: number;
};

export type AuthResult =
    | { ok: true }
    | {
          ok: false;
          error: string;
          field?: 'name' | 'mobile' | 'password' | 'confirm';
      };

type AuthPageProps = {
    auth?: {
        user?: {
            id: number;
            name: string;
            username?: string;
            phone: string;
            sign_up_at?: string | null;
            created_at?: string | null;
        } | null;
    };
    errors?: Record<string, string>;
};

/**
 * تبدیل تاریخ عضویت دریافت‌شده از Laravel به timestamp
 * تاریخ‌های YYYY-MM-DD و تاریخ‌های ISO پشتیبانی می‌شوند.
 */
function parseMembershipDate(
    signUpAt?: string | null,
    createdAt?: string | null,
): number {
    const dateValue = signUpAt || createdAt;

    if (!dateValue) {
        return 0;
    }

    const normalizedDate = dateValue.trim();

    if (!normalizedDate) {
        return 0;
    }

    // تاریخ دیتابیس به شکل YYYY-MM-DD
    // ساعت ظهر برای جلوگیری از جابه‌جایی روز به‌خاطر منطقه زمانی
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
        const timestamp = new Date(`${normalizedDate}T12:00:00`).getTime();
        return Number.isNaN(timestamp) ? 0 : timestamp;
    }

    // تاریخ کامل ISO یا timestamp قابل‌خواندن
    const timestamp = new Date(normalizedDate).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function useCurrentUser(): User | null {
    const { auth } = usePage<AuthPageProps>().props;
    const user = auth?.user;

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        name: user.name,
        mobile: user.phone,
        createdAt: parseMembershipDate(
            user.sign_up_at,
            user.created_at,
        ),
    };
}

export async function loginUser(
    mobileInput: string,
    password: string,
): Promise<AuthResult> {
    const mobile = normalizeMobile(mobileInput);

    if (!mobile || !password) {
        return {
            ok: false,
            error: 'شماره‌ی موبایل یا رمز عبور درست نیست.',
        };
    }

    return new Promise((resolve) => {
        router.post(
            '/login',
            {
                phone: mobile,
                password,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    resolve({ ok: true });
                },

                onError: (errors) => {
                    resolve({
                        ok: false,
                        error:
                            errors.phone ??
                            errors.password ??
                            'ورود انجام نشد؛ اطلاعات واردشده را بررسی کنید.',
                        field: errors.phone ? 'mobile' : 'password',
                    });
                },

                onNetworkError: () => {
                    resolve({
                        ok: false,
                        error: 'ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.',
                    });
                },
            },
        );
    });
}

export async function registerUser(input: {
    name: string;
    mobile: string;
    password: string;
}): Promise<AuthResult> {
    const name = input.name.trim().replace(/\s+/g, ' ');
    const mobile = normalizeMobile(input.mobile);

    if (name.length < 3) {
        return {
            ok: false,
            field: 'name',
            error: 'نام و نام خانوادگی را وارد کنید.',
        };
    }

    if (!mobile) {
        return {
            ok: false,
            field: 'mobile',
            error: 'شماره‌ی موبایل معتبر نیست؛ مثلاً 09123456789',
        };
    }

    if (input.password.length < 8) {
        return {
            ok: false,
            field: 'password',
            error: 'رمز عبور باید حداقل ۸ کاراکتر باشد.',
        };
    }

    return new Promise((resolve) => {
        router.post(
            '/register',
            {
                name,
                username: mobile,
                phone: mobile,
                password: input.password,
                password_confirmation: input.password,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    resolve({ ok: true });
                },

                onError: (errors) => {
                    const field = errors.name
                        ? 'name'
                        : errors.phone || errors.username
                          ? 'mobile'
                          : errors.password
                            ? 'password'
                            : 'confirm';

                    resolve({
                        ok: false,
                        field,
                        error:
                            errors.name ??
                            errors.phone ??
                            errors.username ??
                            errors.password ??
                            'ثبت‌نام انجام نشد؛ اطلاعات را بررسی کنید.',
                    });
                },

                onNetworkError: () => {
                    resolve({
                        ok: false,
                        error: 'ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.',
                    });
                },
            },
        );
    });
}

export function logoutUser(): void {
    router.post('/logout');
}

