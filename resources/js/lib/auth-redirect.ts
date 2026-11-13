// فقط آدرس‌های داخلی سایت مجازن؛ جلوی «open redirect» رو می‌گیره
export function safeNext(value: string | null | undefined): string {
    if (!value) return '/';
    if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/';
    if (/^\/(login|register)(\/|\?|#|$)/.test(value)) return '/';
    return value;
}

export function readAuthParams(url: string): { next: string; reason: string | null } {
    const params = new URL(url, 'http://localhost').searchParams;
    return { next: safeNext(params.get('next')), reason: params.get('reason') };
}

export function authUrl(page: 'login' | 'register', next: string, reason?: string): string {
    const query = new URLSearchParams();
    const target = safeNext(next);
    if (target !== '/') query.set('next', target);
    if (reason) query.set('reason', reason);
    const text = query.toString();
    return `/${page}${text ? `?${text}` : ''}`;
}
