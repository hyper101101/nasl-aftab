import { router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDialog from './confirm-dialog';
import AdminForm, { ROLES, type AdminRow } from './admin-form';

type Props = {
    admins: AdminRow[];
    currentAdminId: number;
};

const addBtn = [
    'inline-flex items-center gap-2 rounded-xl bg-pine px-5 py-3 font-bold text-cream',
    'transition-colors hover:bg-pine/85',
].join(' ');

const th = 'px-4 py-3 text-start text-sm font-bold';
const td = 'px-4 py-3 align-middle';

const iconBtn = [
    'inline-flex items-center justify-center rounded-lg border border-pine/20 px-3 py-2 text-xs font-bold',
    'transition-colors hover:bg-pine hover:text-cream',
].join(' ');

const deleteBtn = [
    'inline-flex items-center justify-center rounded-lg border border-bordo/40 px-3 py-2 text-xs font-bold text-bordo',
    'transition-colors hover:bg-bordo hover:text-cream',
].join(' ');

const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

export default function AdminsPanel({ admins, currentAdminId }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [editing, setEditing] = useState<AdminRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminRow | null>(null);
    const [note, setNote] = useState('');

    function openAdd() {
        setEditing(null);
        setFormKey((k) => k + 1);
        setFormOpen(true);
    }

    function openEdit(admin: AdminRow) {
        setEditing(admin);
        setFormKey((k) => k + 1);
        setFormOpen(true);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        setDeleteTarget(null);
        router.delete('/admin/admins/delete', { data: { id }, preserveScroll: true });
    }

    // لینک ورود مخفی ادمین: /admin-{url_name}/{login_token}/admin/login (نمایش داده نمی‌شه، فقط کپی می‌شه)
    async function copyLoginLink(admin: AdminRow) {
        if (!admin.login_token) return;
        const link = `${window.location.origin}/admin-${admin.url_name}/${admin.login_token}/admin/login`;

        try {
            await navigator.clipboard.writeText(link);
            setNote(`لینک ورود «${admin.name}» کپی شد. آن را فقط برای همان فرد بفرستید.`);
        } catch {
            setNote('کپی انجام نشد؛ مرورگر اجازه‌ی دسترسی به کلیپ‌بورد را نداد.');
        }
        window.setTimeout(() => setNote(''), 5000);
    }

    const roleLabel = (role: string) => ROLES.find((r) => r.value === role)?.label ?? role;

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-xl leading-7 text-pine/75">
                    ادمین‌ها فقط از طریق لینک ورود مخفی خودشان وارد پنل می‌شوند. این بخش فقط برای مدیر کل نمایش داده می‌شود.
                </p>
                <button type="button" onClick={openAdd} className={addBtn}>
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    افزودن ادمین
                </button>
            </div>

            <p role="status" aria-live="polite" className="mt-4 min-h-6 text-sm font-bold">
                {note}
            </p>

            <div className="mt-2 overflow-x-auto rounded-3xl border border-pine/15 bg-pine/5">
                <table className="w-full min-w-[46rem] text-sm">
                    <caption className="sr-only">فهرست ادمین‌ها</caption>
                    <thead className="border-b border-pine/15 bg-pine/10">
                        <tr>
                            <th scope="col" className={th}>نام</th>
                            <th scope="col" className={th}>نام کاربری</th>
                            <th scope="col" className={th}>نقش</th>
                            <th scope="col" className={th}>نام لینک</th>
                            <th scope="col" className={th}>تاریخ ایجاد</th>
                            <th scope="col" className={th}>عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-pine/70">
                                    ادمینی ثبت نشده است.
                                </td>
                            </tr>
                        )}

                        {admins.map((admin) => {
                            const isSelf = admin.id === currentAdminId;

                            return (
                                <tr key={admin.id} className="border-b border-pine/10 last:border-0">
                                    <td className={td}>
                                        <span className="font-bold">{admin.name}</span>
                                        {isSelf && <span className="ms-2 rounded-full bg-pine px-2 py-0.5 text-xs text-cream">شما</span>}
                                    </td>
                                    <td className={td}>
                                        <span dir="ltr" className="inline-block font-mono text-xs">
                                            {admin.username}
                                        </span>
                                    </td>
                                    <td className={td}>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${admin.role === 'super' ? 'bg-bordo text-cream' : 'bg-pine/10'}`}>
                                            {roleLabel(admin.role)}
                                        </span>
                                    </td>
                                    <td className={td}>
                                        <span dir="ltr" className="inline-block font-mono text-xs">
                                            {admin.url_name}
                                        </span>
                                    </td>
                                    <td className={td}>
                                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString('fa-IR', dateOptions) : '—'}
                                    </td>
                                    <td className={td}>
                                        <div className="flex flex-wrap gap-2">
                                            {admin.login_token && (
                                                <button type="button" onClick={() => void copyLoginLink(admin)} className={iconBtn}>
                                                    کپی لینک ورود
                                                </button>
                                            )}
                                            <button type="button" onClick={() => openEdit(admin)} aria-label={`ویرایش ${admin.name}`} className={iconBtn}>
                                                ویرایش
                                            </button>
                                            {!isSelf && (
                                                <button type="button" onClick={() => setDeleteTarget(admin)} aria-label={`حذف ${admin.name}`} className={deleteBtn}>
                                                    حذف
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <AdminForm key={formKey} open={formOpen} admin={editing} onClose={() => setFormOpen(false)} />

            <ConfirmDialog
                open={deleteTarget !== null}
                title="حذف ادمین"
                message={`دسترسی «${deleteTarget?.name ?? ''}» برای همیشه حذف می‌شود. ادامه می‌دهید؟`}
                confirmLabel="بله، حذف شود"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    );
}
