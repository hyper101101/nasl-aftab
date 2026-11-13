import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import ProductArt from '../product-art';
import { categories, type CategoryId, type Product } from '../../data/products';
import { quickUpdate } from '../../lib/admin-api';
import { finalPrice, hasOffer, isSoldOut, normalizeFa } from '../../lib/catalog';
import ConfirmDialog from './confirm-dialog';
import ProductForm from './product-form';

const addBtn = [
    'inline-flex items-center gap-2 rounded-xl bg-pine px-5 py-3 font-bold text-cream',
    'transition-colors hover:bg-pine/85',
].join(' ');

const inputClass = [
    'rounded-xl border border-pine/25 bg-pine/5 px-4 py-2.5 text-pine',
    'placeholder:text-pine/45 focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/30',
].join(' ');

const tableBox = 'mt-6 overflow-x-auto rounded-3xl border border-pine/15 bg-pine/5';
const th = 'px-4 py-3 text-start text-sm font-bold';
const td = 'px-4 py-3 align-middle';

const stockInput = [
    'w-20 rounded-lg border border-pine/25 bg-cream px-2 py-1.5 text-center',
    'focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/30',
].join(' ');

const iconBtn = [
    'inline-flex size-9 items-center justify-center rounded-lg border border-pine/20',
    'transition-colors hover:bg-pine hover:text-cream',
].join(' ');

const deleteBtn = [
    'inline-flex size-9 items-center justify-center rounded-lg border border-bordo/40 text-bordo',
    'transition-colors hover:bg-bordo hover:text-cream',
].join(' ');

const categoryLabel = (id: CategoryId) => categories.find((c) => c.id === id)?.label ?? id;

function Switch({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={label}
            onClick={onClick}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-bordo' : 'bg-pine/20'}`}
        >
            <span className={`absolute top-0.5 size-5 rounded-full ${on ? 'end-0.5 bg-cream' : 'start-0.5 bg-pine'}`} />
        </button>
    );
}

export default function ProductsPanel({ products }: { products: Product[] }) {
    const [q, setQ] = useState('');
    const [cat, setCat] = useState<'all' | CategoryId>('all');
    const [formOpen, setFormOpen] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [editing, setEditing] = useState<Product | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

    const rows = useMemo(() => {
        const query = normalizeFa(q);
        return products.filter((p) => {
            const text = normalizeFa(`${p.code} ${p.name} ${p.grade} ${p.variety}`);
            return (cat === 'all' || p.category === cat) && (!query || text.includes(query));
        });
    }, [products, q, cat]);

    const soldOutCount = products.filter((p) => isSoldOut(p)).length;
    const offerCount = products.filter((p) => hasOffer(p)).length;

    function openAdd() {
        setEditing(null);
        setFormKey((k) => k + 1);
        setFormOpen(true);
    }

    function openEdit(product: Product) {
        setEditing(product);
        setFormKey((k) => k + 1);
        setFormOpen(true);
    }

    function toggleOffer(p: Product) {
        if (p.special) {
            quickUpdate(p, { special: false });
        } else if (p.discount > 0) {
            quickUpdate(p, { special: true });
        } else {
            openEdit(p); // هنوز درصد تخفیفی تعیین نشده
        }
    }

    function commitStock(p: Product, value: string) {
        const n = Math.max(0, Math.floor(Number(value)));
        if (Number.isNaN(n) || n === p.stock) return;
        quickUpdate(p, { stock: n });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        setDeleteTarget(null);
        router.delete('/admin/product/delete', { data: { id }, preserveScroll: true });
    }

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-pine/75">افزودن، ویرایش، موجودی و پیشنهادهای ویژه</p>
                <button type="button" onClick={openAdd} className={addBtn}>
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    افزودن محصول
                </button>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                    { label: 'کل محصولات', value: products.length },
                    { label: 'ناموجود یا غیرقابل فروش', value: soldOutCount },
                    { label: 'پیشنهاد ویژه فعال', value: offerCount },
                ].map((s) => (
                    <div key={s.label} className="rounded-2xl bg-pine px-5 py-4 text-cream">
                        <dt className="text-sm text-cream/75">{s.label}</dt>
                        <dd className="mt-1 text-3xl font-extrabold">{s.value.toLocaleString('fa-IR')}</dd>
                    </div>
                ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
                <label className="sr-only" htmlFor="admin-q">
                    جستجوی محصول
                </label>
                <input
                    id="admin-q"
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="جستجو با نام، کد یا درجه..."
                    className={`${inputClass} min-w-56 flex-1`}
                />

                <label className="sr-only" htmlFor="admin-cat">
                    فیلتر دسته‌بندی
                </label>
                <select id="admin-cat" value={cat} onChange={(e) => setCat(e.target.value as 'all' | CategoryId)} className={inputClass}>
                    <option value="all">همه‌ی دسته‌ها</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={tableBox}>
                <table className="w-full min-w-[68rem] text-sm">
                    <caption className="sr-only">فهرست محصولات</caption>
                    <thead className="border-b border-pine/15 bg-pine/10">
                        <tr>
                            <th scope="col" className={th}>کد</th>
                            <th scope="col" className={th}>محصول</th>
                            <th scope="col" className={th}>دسته</th>
                            <th scope="col" className={th}>قیمت (تومان)</th>
                            <th scope="col" className={th}>موجودی</th>
                            <th scope="col" className={th}>پیشنهاد ویژه</th>
                            <th scope="col" className={th}>قابل فروش</th>
                            <th scope="col" className={th}>عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center text-pine/70">
                                    محصولی پیدا نشد.
                                </td>
                            </tr>
                        )}

                        {rows.map((p) => {
                            const offer = hasOffer(p);

                            return (
                                <tr key={p.id} className="border-b border-pine/10 last:border-0">
                                    <td className={`${td} whitespace-nowrap`}>
                                        <span dir="ltr" className="inline-block font-mono text-xs font-bold">
                                            {p.code}
                                        </span>
                                    </td>

                                    <td className={td}>
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-pine">
                                                {p.image ? (
                                                    <img src={p.image} alt="" width={48} height={48} className="size-full object-cover" />
                                                ) : (
                                                    <ProductArt category={p.category} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold">{p.name}</p>
                                                <p className="text-xs text-pine/70">
                                                    {p.grade}
                                                    {p.variety ? ` · ${p.variety}` : ''}
                                                    {p.wholesale ? ' · عمده' : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className={td}>{categoryLabel(p.category)}</td>

                                    <td className={td}>
                                        {offer && <s className="block text-xs text-pine/60">{p.price.toLocaleString('fa-IR')}</s>}
                                        <span className="font-bold">{finalPrice(p).toLocaleString('fa-IR')}</span>
                                    </td>

                                    <td className={td}>
                                        <input
                                            key={`${p.id}:${p.stock}`}
                                            type="number"
                                            min={0}
                                            inputMode="numeric"
                                            defaultValue={p.stock}
                                            aria-label={`موجودی ${p.name}`}
                                            onBlur={(e) => commitStock(p, e.currentTarget.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') e.currentTarget.blur();
                                            }}
                                            className={stockInput}
                                        />
                                        {p.stock <= 0 && <span className="ms-2 text-xs font-bold text-bordo">ناموجود</span>}
                                    </td>

                                    <td className={td}>
                                        <div className="flex items-center gap-2">
                                            <Switch on={p.special} label={`پیشنهاد ویژه ${p.name}`} onClick={() => toggleOffer(p)} />
                                            {p.discount > 0 && <span className="text-xs font-bold">{p.discount.toLocaleString('fa-IR')}٪</span>}
                                        </div>
                                    </td>

                                    <td className={td}>
                                        <Switch on={p.available} label={`قابل فروش بودن ${p.name}`} onClick={() => quickUpdate(p, { available: !p.available })} />
                                    </td>

                                    <td className={td}>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => openEdit(p)} aria-label={`ویرایش ${p.name}`} className={iconBtn}>
                                                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <path d="M4 20h4L19 9l-4-4L4 16z" />
                                                </svg>
                                            </button>
                                            <button type="button" onClick={() => setDeleteTarget(p)} aria-label={`حذف ${p.name}`} className={deleteBtn}>
                                                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <ProductForm key={formKey} open={formOpen} product={editing} onClose={() => setFormOpen(false)} />

            <ConfirmDialog
                open={deleteTarget !== null}
                title="حذف محصول"
                message={`«${deleteTarget?.name ?? ''}» برای همیشه حذف می‌شود. ادامه می‌دهید؟`}
                confirmLabel="بله، حذف شود"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    );
}
