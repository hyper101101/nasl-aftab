import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import AuthShell from '../components/auth/auth-shell';
import TextField from '../components/auth/text-field';
import { authUrl, readAuthParams } from '../lib/auth-redirect';
import { loginUser, useCurrentUser } from '../lib/auth-store';

const submitBtn = [
    'w-full rounded-xl bg-pine py-3.5 font-bold text-cream transition-colors',
    'hover:bg-pine/85 disabled:cursor-wait disabled:opacity-60',
].join(' ');

export default function Login() {
    const { url } = usePage();
    const { next, reason } = readAuthParams(url);
    const user = useCurrentUser();

    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    // بعد از ورود موفق (یا اگه از قبل وارد بوده) به صفحه‌ی مقصد می‌ره
    useEffect(() => {
        if (user) router.visit(next, { replace: true });
    }, [user, next]);

    async function submit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setBusy(true);
        const result = await loginUser(mobile, password);
        setBusy(false);
        if (!result.ok) setError(result.error);
    }

    return (
        <AuthShell
            title="ورود به حساب کاربری"
            subtitle="با شماره‌ی موبایل و رمز عبور وارد شوید."
            notice={reason === 'checkout' ? 'برای ثبت سفارش ابتدا وارد حساب خود شوید یا ثبت‌نام کنید.' : undefined}
            footer={
                <>
                    حساب کاربری ندارید؟{' '}
                    <Link href={authUrl('register', next, reason ?? undefined)} className="font-bold underline underline-offset-4">
                        ثبت‌نام
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} noValidate className="space-y-4">
                {error && (
                    <p role="alert" className="rounded-xl bg-bordo px-4 py-3 text-sm font-bold text-cream">
                        {error}
                    </p>
                )}

                <TextField
                    id="login-mobile"
                    label="شماره‌ی موبایل"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="username"
                    ltr
                    placeholder="09123456789"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                />
                <TextField
                    id="login-password"
                    label="رمز عبور"
                    type="password"
                    autoComplete="current-password"
                    revealable
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" disabled={busy} className={submitBtn}>
                    {busy ? 'در حال ورود...' : 'ورود'}
                </button>
            </form>
        </AuthShell>
    );
}
