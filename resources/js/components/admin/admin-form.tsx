import { router } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useShared } from '../../lib/shared';

export type AdminRow = {
    id: number;
    name: string;
    role: string;
    username: string;
    url_name: string;
    login_token?: string;
    created_at: string | null;
};

export const ROLES: Array<{ value: string; label: string; hint: string }> = [
    { value: 'super', label: 'مدیر کل', hint: 'مدیریت محصولات و ادمین‌ها' },
    { value: 'common', label: 'ادمین عادی', hint: 'فقط مدیریت محصولات' },
];

type Props = {
    open: boolean;
    admin: AdminRow | null; // خالی یعنی ادمین جدید
    onClose: () => void;
};

type FormState = {
    name: string;
    username: string;
    role: string;
    urlName: string;
    password: string;
    confirm: string;
};

const dialogClass = [
    'on-cream m-auto w-[calc(100%-1.5rem)] max-w-xl rounded-3xl bg-cream text-pine',
    'max-h-[92vh] overflow-y-auto p-0 shadow-2xl',
    'backdrop:bg-pine/70 backdrop:backdrop-blur-sm',
].join(' ');

const inputClass = [
    'w-full rounded-xl border border-pine/25 bg-pine/5 px-4 py-2.5 text-pine',
    'placeholder:text-pine/45 focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/30',
].join(' ');

const primaryBtn = [
    'rounded-xl bg-pine px-6 py-3 font-bold text-cream transition-colors',
    'hover:bg-pine/85 disabled:cursor-wait disabled:opacity-60',
].join(' ');

function Field({ name, label, error, hint, children }: { name: string; label: string; error?: string; hint?: string; children: ReactNode }) {
    return (
        <div>
            <label htmlFor={`a-${name}`} className="mb-1.5 block text-sm font-bold">
                {label}
            </label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-pine/65">{hint}</p>}
            {error && (
                <p id={`a-${name}-error`} role="alert" className="mt-1 text-xs font-bold text-bordo">
                    {error}
                </p>
            )}
        </div>
    );
}

function initial(a: AdminRow | null): FormState {
    return {
        name: a?.name ?? '',
        username: a?.username ?? '',
        role: a?.role ?? 'common',
        urlName: a?.url_name ?? '',
        password: '',
        confirm: '',
    };
}

export default function AdminForm({ open, admin, onClose }: Props) {
    const ref = useRef<HTMLDialogElement>(null);
    const { errors: serverErrors } = useShared();
    const [f, setF] = useState<FormState>(() => initial(admin));
    const [local, setLocal] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setF((s) => ({ ...s, [key]: value }));
    const errorOf = (key: string) => local[key] || serverErrors?.[key];
    const field = (key: string) => ({
        id: `a-${key}`,
        'aria-invalid': errorOf(key) ? true : undefined,
        'aria-describedby': errorOf(key) ? `a-${key}-error` : undefined,
    });

    function validate(): Record<string, string> {
        const e: Record<string, string> = {};

        if (f.name.trim().length < 3) e.name = 'نام را وارد کنید (حداقل ۳ نویسه).';
        if (!/^[A-Za-z0-9_.-]{3,30}$/.test(f.username)) e.username = 'نام کاربری: ۳ تا ۳۰ نویسه‌ی انگلیسی، عدد، نقطه، خط تیره یا خط زیر.';
        if (!/^[a-z0-9-]{3,40}$/.test(f.urlName)) e.url_name = 'نام لینک: ۳ تا ۴۰ نویسه‌ی انگلیسی کوچک، عدد یا خط تیره.';
        if (!ROLES.some((r) => r.value === f.role)) e.role = 'نقش را انتخاب کنید.';

        if (!admin || f.password) {
            if (f.password.length < 10) e.password = 'رمز عبور باید حداقل ۱۰ کاراکتر باشد.';
            else if (f.password !== f.confirm) e.password_confirmation = 'تکرار رمز عبور با رمز عبور یکسان نیست.';
        }

        return e;
    }

    function submit(e: FormEvent) {
        e.preventDefault();

        const found = validate();
        setLocal(found);
        if (Object.keys(found).length > 0) return;

        const options = {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
            onSuccess: () => onClose(),
        };

        const base = { name: f.name.trim(), username: f.username, role: f.role, url_name: f.urlName };

        if (admin) {
            // رمز خالی یعنی بدون تغییر
            router.put(
                '/admin/admins/edit',
                f.password ? { ...base, id: admin.id, password: f.password, password_confirmation: f.confirm } : { ...base, id: admin.id },
                options,
            );
        } else {
            router.post('/admin/admins/add', { ...base, password: f.password, password_confirmation: f.confirm }, options);
        }
    }

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === ref.current) onClose();
            }}
            aria-labelledby="admin-form-title"
            className={dialogClass}
        >
            <form onSubmit={submit} noValidate autoComplete="off" className="p-6 sm:p-8">
                <h2 id="admin-form-title" className="text-2xl font-extrabold">
                    {admin ? 'ویرایش ادمین' : 'افزودن ادمین جدید'}
                </h2>

                {(Object.keys(local).length > 0 || Object.keys(serverErrors ?? {}).length > 0) && (
                    <p role="alert" className="mt-4 rounded-xl bg-bordo px-4 py-3 text-sm font-bold text-cream">
                        لطفاً خطاهای مشخص‌شده را اصلاح کنید.
                    </p>
                )}

                <div className="mt-6 space-y-4">
                    <Field name="name" label="نام و نام خانوادگی" error={errorOf('name')}>
                        <input {...field('name')} value={f.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
                    </Field>

                    <Field name="username" label="نام کاربری" error={errorOf('username')}>
                        <input
                            {...field('username')}
                            dir="ltr"
                            autoComplete="off"
                            value={f.username}
                            onChange={(e) => set('username', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field name="role" label="نقش" error={errorOf('role')} hint={ROLES.find((r) => r.value === f.role)?.hint}>
                        <select {...field('role')} value={f.role} onChange={(e) => set('role', e.target.value)} className={inputClass}>
                            {ROLES.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        name="url_name"
                        label="نام لینک ورود"
                        error={errorOf('url_name')}
                        hint="بخشی از آدرس مخفی ورود؛ مثلاً admin-AbC123 (یکتا باشد)."
                    >
                        <input
                            {...field('url_name')}
                            dir="ltr"
                            value={f.urlName}
                            onChange={(e) => set('urlName', e.target.value.toLowerCase())}
                            className={inputClass}
                        />
                    </Field>

                    <Field
                        name="password"
                        label={admin ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور'}
                        error={errorOf('password')}
                        hint={admin ? 'اگر خالی بگذارید رمز تغییر نمی‌کند.' : 'حداقل ۱۰ کاراکتر'}
                    >
                        <input
                            {...field('password')}
                            type="password"
                            dir="ltr"
                            autoComplete="new-password"
                            value={f.password}
                            onChange={(e) => set('password', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field name="password_confirmation" label="تکرار رمز عبور" error={errorOf('password_confirmation')}>
                        <input
                            {...field('password_confirmation')}
                            type="password"
                            dir="ltr"
                            autoComplete="new-password"
                            value={f.confirm}
                            onChange={(e) => set('confirm', e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="rounded-xl border border-pine/30 px-6 py-3 font-medium hover:bg-pine/10">
                        انصراف
                    </button>
                    <button type="submit" disabled={busy} className={primaryBtn}>
                        {admin ? 'ذخیره‌ی تغییرات' : 'افزودن ادمین'}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
