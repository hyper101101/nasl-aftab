import { toLatinDigits } from './catalog';

// شماره‌ی موبایل ایران رو به شکل 09123456789 برمی‌گردونه؛ نامعتبر = null
export function normalizeMobile(value: string): string | null {
    const digits = toLatinDigits(value).replace(/\D/g, '');
    const match = digits.match(/^(?:0098|98|0)?(9\d{9})$/);
    return match ? `0${match[1]}` : null;
}
