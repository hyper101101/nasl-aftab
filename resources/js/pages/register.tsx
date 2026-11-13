import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import AuthShell from '../components/auth/auth-shell';
import TextField from '../components/auth/text-field';
import { authUrl, readAuthParams } from '../lib/auth-redirect';
import { registerUser, useCurrentUser } from '../lib/auth-store';

const submitBtn = [
    'w-full rounded-xl bg-pine py-3.5 font-bold text-cream transition-colors',
    'hover:bg-pine/85 disabled:cursor-wait disabled:opacity-60',
].join(' ');

export default function Register() {
    const { url } = usePage();
    const { next, reason } = readAuthParams(url);
    const user = useCurrentUser();

    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    // بعد از ثبت‌نام موفق (کاربر خودکار وارد می‌شه) به صفحه‌ی مقصد می‌ره
    useEffect(() => {
        if (user) router.visit(next, { replace: true });
    }, [user, next]);

    async function submit(e: FormEvent) {
        e.preventDefault();

        if (password !== confirm) {
            setErrors({ confirm: 'تکرار رمز عبور با رمز عبور یکسان نیست.' });
            return;
        }

        setErrors({});
        setBusy(true);
        const result = await registerUser({ name, mobile, password });
        setBusy(false);

        if (!result.ok) setErrors({ [result.field ?? 'form']: result.error });
    }

    return (
        <AuthShell
            title="ثبت‌نام"
            subtitle="برای ثبت سفارش و پیگیری آن حساب کاربری بسازید."
            notice={reason === 'checkout' ? 'برای ثبت سفارش ابتدا ثبت‌نام کنید یا وارد حساب خود شوید.' : undefined}
            footer={
                <>
                    قبلاً ثبت‌نام کرده‌اید؟{' '}
                    <Link href={authUrl('login', next, reason ?? undefined)} className="font-bold underline underline-offset-4">
                        ورود
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} noValidate className="space-y-4">
                {errors.form && (
                    <p role="alert" className="rounded-xl bg-bordo px-4 py-3 text-sm font-bold text-cream">
                        {errors.form}
                    </p>
                )}

                <TextField
                    id="reg-name"
                    label="نام و نام خانوادگی"
                    autoComplete="name"
                    value={name}
                    error={errors.name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    id="reg-mobile"
                    label="شماره‌ی موبایل"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    ltr
                    placeholder="09123456789"
                    value={mobile}
                    error={errors.mobile}
                    onChange={(e) => setMobile(e.target.value)}
                />
                <TextField
                    id="reg-password"
                    label="رمز عبور"
                    type="password"
                    autoComplete="new-password"
                    revealable
                    hint="حداقل ۸ کاراکتر"
                    value={password}
                    error={errors.password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                    id="reg-confirm"
                    label="تکرار رمز عبور"
                    type="password"
                    autoComplete="new-password"
                    revealable
                    value={confirm}
                    error={errors.confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                />

                <button type="submit" disabled={busy} className={submitBtn}>
                    {busy ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                </button>
            </form>
        </AuthShell>
    );
}
