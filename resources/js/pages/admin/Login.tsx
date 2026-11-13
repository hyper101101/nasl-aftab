import { router, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import Logo from '../../components/logo';
import AdminLayout from '../../layouts/admin-layout';
import { useShared } from '../../lib/shared';

const inputClass = [
    'w-full rounded-xl border border-pine/25 bg-pine/5 px-4 py-3 text-pine',
    'placeholder:text-pine/45 focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/30',
].join(' ');

const submitBtn = [
    'w-full rounded-xl bg-pine py-3.5 font-bold text-cream transition-colors',
    'hover:bg-pine/85 disabled:cursor-wait disabled:opacity-60',
].join(' ');

// فرم به همون آدرس فعلی (لینک مخفی ورود) POST می‌شه؛ نام فیلدها: username و password
export default function AdminLogin() {
    const { url } = usePage();
    const { errors } = useShared();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);

    const general = Object.entries(errors ?? {}).find(([key]) => key !== 'username' && key !== 'password')?.[1] || '';

    function submit(e: FormEvent) {
        e.preventDefault();
        router.post(
            url.split('?')[0],
            { username, password },
            { onStart: () => setBusy(true), onFinish: () => setBusy(false) },
        );
    }

    return (
        <AdminLayout title="ورود">
            <div className="mx-auto max-w-md px-4 py-16">
                <div className="rounded-3xl bg-pine p-6 text-cream sm:p-8">
                    <Logo />
                    <h1 className="mt-6 text-2xl font-extrabold">ورود به پنل مدیریت</h1>
                </div>

                <form onSubmit={submit} noValidate className="mt-6 space-y-4 rounded-3xl border border-pine/15 p-6 sm:p-8">
                    {general && (
                        <p role="alert" className="rounded-xl bg-bordo px-4 py-3 text-sm font-bold text-cream">
                            {general}
                        </p>
                    )}

                    <div>
                        <label htmlFor="admin-username" className="mb-1.5 block text-sm font-bold">
                            نام کاربری
                        </label>
                        <input
                            id="admin-username"
                            dir="ltr"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            aria-invalid={errors?.username ? true : undefined}
                            className={inputClass}
                        />
                        {errors?.username && <p role="alert" className="mt-1 text-xs font-bold text-bordo">{errors.username}</p>}
                    </div>

                    <div>
                        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-bold">
                            رمز عبور
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            dir="ltr"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            aria-invalid={errors?.password ? true : undefined}
                            className={inputClass}
                        />
                        {errors?.password && <p role="alert" className="mt-1 text-xs font-bold text-bordo">{errors.password}</p>}
                    </div>

                    <button type="submit" disabled={busy} className={submitBtn}>
                        {busy ? 'در حال ورود...' : 'ورود'}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}
