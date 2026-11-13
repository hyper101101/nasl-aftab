
import type { ProductInput, SaveResult } from '../../lib/product-store';
import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../layouts/admin-layout';
import ConfirmDialog from '../../components/admin/confirm-dialog';
import ProductForm from '../../components/admin/product-form';
import ProductArt from '../../components/product-art';
import { categories, type CategoryId, type Product } from '../../data/products';
import { finalPrice, hasOffer, normalizeFa } from '../../lib/catalog';

type DatabaseProduct = {
    id: number;
    code: string;
    slug: string;
    name: string;
    category: string;
    quality: string;
    type: string | null;
    description?: string | null;
    price: number;
    sale_unit: string;
    package_type: string;
    stock: number;
    image: string | null;
    is_special_offer: boolean;
    discount_percent: number | null;
    show_first_page: boolean;
    is_available: boolean;
};

type PaginatedProducts = {
    data: DatabaseProduct[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};

type ProductRoutes = {
    store: string;
    edit: string;
    delete: string;
};

type AdminInfo = {
    id: number;
    name: string;
    username: string;
    role: string;
    url_name: string;
    created_at: string | null;
};

type Props = {
    products: PaginatedProducts;
    productRoutes: ProductRoutes;
    admins?: AdminInfo[];
};

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

const categoryLabel = (id: string) =>
    categories.find((c) => c.id === id)?.label ?? id;

function imageUrl(image: string | null) {
    if (!image) return undefined;
    if (/^https?:\/\//i.test(image) || image.startsWith('/')) return image;
    return `/storage/${image}`;
}

function toFormProduct(p: DatabaseProduct): Product {
    const categoryMap: Record<string, CategoryId> = {
        zereshk: 'barberry',
        'gol-mohammadi': 'rose',
        saffron: 'zaferan',
        other: 'other',
        barberry: 'barberry',
        rose: 'rose',
        zaferan: 'zaferan',
    };

    return {
        id: p.id,
        code: p.code,
        slug: p.slug,
        name: p.name,
        category: categoryMap[p.category] ?? 'other',
        grade: p.quality,
        variety: p.type ?? '',
        description: p.description ?? '',
        price: Number(p.price),
        unit: p.sale_unit,
        stock: Number(p.stock ?? 0),
        image: imageUrl(p.image),
        wholesale:
            p.package_type === 'wholesale' ||
            p.package_type === 'عمده',
        featured: Boolean(p.show_first_page),
        special: Boolean(p.is_special_offer),
        discount: Number(p.discount_percent ?? 0),
    };
}

function toProductInput(product: Product, patch: Partial<Product> = {}): ProductInput {
    const { id: _id, ...current } = product;
    const { id: _patchId, ...safePatch } = patch;

    return {
        ...current,
        ...safePatch,
        code: String(safePatch.code ?? current.code),
        name: String(safePatch.name ?? current.name),
        category: safePatch.category ?? current.category,
        grade: String(safePatch.grade ?? current.grade),
        variety: safePatch.variety ?? current.variety,
        description: String(safePatch.description ?? current.description ?? ''),
        price: Number(safePatch.price ?? current.price),
        unit: String(safePatch.unit ?? current.unit),
        stock: Number(safePatch.stock ?? current.stock ?? 0),
        wholesale: Boolean(safePatch.wholesale ?? current.wholesale),
        featured: Boolean(safePatch.featured ?? current.featured),
        special: Boolean(safePatch.special ?? current.special),
        discount: safePatch.discount ?? current.discount,
    };
}

export default function AdminProducts({
    products,
    productRoutes,
    admins = [],
}: Props) {
    const all = useMemo(
        () => (products?.data ?? []).map(toFormProduct),
        [products],
    );
console.log('Products from Laravel:', products);
console.log('Converted products:', all);
    const [q, setQ] = useState('');
    const [cat, setCat] = useState<'all' | CategoryId>('all');
    const [formOpen, setFormOpen] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [editing, setEditing] = useState<Product | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [notice, setNotice] = useState('');

    const rows = useMemo(() => {
        const query = normalizeFa(q);

        return all.filter((p) => {
            const text = normalizeFa(
                `${p.code} ${p.name} ${p.grade} ${p.variety ?? ''}`,
            );

            return (
                (cat === 'all' || p.category === cat) &&
                (!query || text.includes(query))
            );
        });
    }, [all, q, cat]);

    const soldOutCount = all.filter((p) => (p.stock ?? 0) <= 0).length;
    const offerCount = all.filter((p) => hasOffer(p)).length;

    function flash(message: string) {
        setNotice(message);
        window.setTimeout(() => setNotice(''), 3500);
    }

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

    function refreshProducts() {
        router.reload({
            only: ['products'],
            onError: () => flash('بروزرسانی فهرست محصولات ناموفق بود.'),
        });
    }

    /**
     * اتصال واقعی فرم افزودن و ویرایش به مسیرهای Laravel.
     * شناسه محصول برای ویرایش از مسیر تعریف‌شده در بک‌اند استفاده می‌شود.
     */
    function handleSave(input: ProductInput): Promise<SaveResult> {
        const isEditing = editing !== null;
        const url = isEditing
            ? productRoutes.edit.replace(
                  '__PRODUCT_ID__',
                  String(editing.id),
              )
            : productRoutes.store;
console.log('Product data sent to Laravel:', input);
        return new Promise((resolve) => {
            const options = {
                preserveScroll: true,

                onSuccess: () => {
                    setFormOpen(false);
                    setEditing(null);
                    flash(isEditing ? 'محصول با موفقیت ویرایش شد.' : 'محصول با موفقیت ثبت شد.');
                    resolve({ ok: true } as SaveResult);
                },

                onError: (errors: Record<string, string>) => {
                    const firstError = Object.values(errors).find(
                        (value) => typeof value === 'string' && value.length > 0,
                    );

                    resolve({
                        ok: false,
                        error: firstError ?? 'ذخیره محصول ناموفق بود. اطلاعات را بررسی کنید.',
                    } as SaveResult);
                },
            };

            if (isEditing) {
                router.put(url, input, options);
            } else {
                router.post(url, input, options);
            }
        });
    }

    /**
     * به‌روزرسانی محصول موجود با ارسال داده کامل فرم به کنترلر.
     */
    function updateProduct(product: Product, patch: Partial<Product>) {
        const url = productRoutes.edit.replace(
            '__PRODUCT_ID__',
            String(product.id),
        );

        router.put(url, toProductInput(product, patch), {
            preserveScroll: true,

            onSuccess: () => {
                flash('محصول با موفقیت بروزرسانی شد.');
                refreshProducts();
            },

            onError: (errors) => {
                const firstError = Object.values(errors).find(
                    (value) => typeof value === 'string' && value.length > 0,
                );

                flash(firstError ?? 'بروزرسانی محصول ناموفق بود.');
            },
        });
    }

    function commitStock(product: Product, value: string) {
        const stock = Number(value);

        if (
            !Number.isInteger(stock) ||
            stock < 0 ||
            stock === product.stock
        ) {
            return;
        }

        updateProduct(product, { stock });
    }

    function toggleOffer(product: Product) {
        if (!product.special && !product.discount) {
            openEdit(product);
            return;
        }

        updateProduct(product, { special: !product.special });
    }

    function confirmDelete() {
        if (!deleteTarget) return;

        const target = deleteTarget;
        const url = productRoutes.delete.replace(
            '__PRODUCT_ID__',
            String(target.id),
        );

        router.delete(url, {
            preserveScroll: true,

            onSuccess: () => {
                setDeleteTarget(null);
                flash('محصول با موفقیت حذف شد.');
                refreshProducts();
            },

            onError: (errors) => {
                const firstError = Object.values(errors).find(
                    (value) => typeof value === 'string' && value.length > 0,
                );

                flash(firstError ?? 'حذف محصول ناموفق بود.');
            },
        });
    }

    return (
        <AdminLayout title="مدیریت محصولات">
            <div className="mx-auto max-w-6xl px-4 py-10">
                {/* دسترسی‌های مدیریتی */}
<section className="mb-8 rounded-3xl border border-pine/15 bg-pine/5 p-5">
    <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h2 className="text-xl font-extrabold">
                دسترسی‌های مدیریتی
            </h2>
            <p className="mt-1 text-sm text-pine/70">
                مدیریت ادمین‌ها و بررسی نظرات کاربران
            </p>
        </div>

        <button
            type="button"
            onClick={() => {
                const commentsUrl = window.location.pathname.replace(
                    /\/panel(?:\/products)?\/?$/,
                    '/panel/comments',
                );

                if (commentsUrl !== window.location.pathname) {
                    router.visit(commentsUrl);
                } else {
                    window.alert(
                        'مسیر پنل شناسایی نشد. لطفاً آدرس صفحه مدیریت را بررسی کنید.',
                    );
                }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-pine px-5 py-3 font-bold text-cream transition-colors hover:bg-pine/85"
        >
            <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 2V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                <path d="M8 10h8M8 14h5" />
            </svg>
            مدیریت نظرات
        </button>
        <button
    type="button"
    onClick={() => router.visit('/chat/list')}
    className="inline-flex items-center gap-2 rounded-xl bg-bordo px-5 py-3 font-bold text-cream transition-colors hover:opacity-90"
>
    <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
        <path d="M8 10h8M8 14h5" />
    </svg>
    مدیریت چت‌ها
</button>



<button
    type="button"
    onClick={() => {
        const articlesUrl = window.location.pathname.replace(
            /\/panel(?:\/products)?\/?$/,
            '/admin/articles',
        );

        if (articlesUrl !== window.location.pathname) {
            router.visit(articlesUrl);
        } else {
            window.alert('مسیر پنل شناسایی نشد. آدرس صفحه مدیریت را بررسی کنید.');
        }
    }}
    className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 font-bold text-white transition-colors hover:bg-amber-800"
>
    <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        <path d="M8 7h8M8 11h8" />
    </svg>
    مدیریت مقالات وبلاگ
</button>



    </div>

    <div className="mt-5 border-t border-pine/15 pt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-extrabold">
                مدیریت ادمین‌ها
            </h3>

            <span className="rounded-full bg-pine/10 px-3 py-1 text-sm font-bold">
                {admins.length.toLocaleString('fa-IR')} ادمین
            </span>
        </div>

        {admins.length === 0 ? (
            <p className="rounded-xl bg-cream p-4 text-sm text-pine/70">
                اطلاعات ادمین‌ها به این صفحه ارسال نشده است.
            </p>
        ) : (
            <div className="overflow-x-auto rounded-2xl border border-pine/15 bg-cream">
                <table className="w-full min-w-[40rem] text-sm">
                    <thead className="border-b border-pine/15 bg-pine/5">
                        <tr>
                            <th className="px-4 py-3 text-start font-bold">
                                نام ادمین
                            </th>
                            <th className="px-4 py-3 text-start font-bold">
                                نام کاربری
                            </th>
                            <th className="px-4 py-3 text-start font-bold">
                                نقش
                            </th>
                            <th className="px-4 py-3 text-start font-bold">
                                تاریخ ایجاد
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {admins.map((admin) => (
                            <tr
                                key={admin.id}
                                className="border-b border-pine/10 last:border-0"
                            >
                                <td className="px-4 py-3 font-bold">
                                    {admin.name}
                                </td>
                                <td className="px-4 py-3">
                                    <span dir="ltr" className="inline-block">
                                        {admin.username}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {admin.role === 'super'
                                        ? 'سوپر ادمین'
                                        : 'ادمین'}
                                </td>
                                <td className="px-4 py-3">
                                    {admin.created_at
                                        ? new Date(
                                              admin.created_at,
                                          ).toLocaleDateString('fa-IR')
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
</section>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold">
                            مدیریت محصولات
                        </h1>
                        <p className="mt-2 text-pine/75">
                            افزودن، ویرایش، موجودی و پیشنهادهای ویژه
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAdd}
                        className={addBtn}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="size-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        افزودن محصول
                    </button>
                </div>

                <p
                    role="status"
                    aria-live="polite"
                    className="mt-4 min-h-6 text-sm font-bold"
                >
                    {notice}
                </p>

                <dl className="mt-2 grid gap-3 sm:grid-cols-3">
                    {[
                        { label: 'کل محصولات', value: products.total },
                        { label: 'ناموجود در این صفحه', value: soldOutCount },
                        { label: 'پیشنهاد ویژه در این صفحه', value: offerCount },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className="rounded-2xl bg-pine px-5 py-4 text-cream"
                        >
                            <dt className="text-sm text-cream/75">
                                {s.label}
                            </dt>
                            <dd className="mt-1 text-3xl font-extrabold">
                                {s.value.toLocaleString('fa-IR')}
                            </dd>
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
                    <select
                        id="admin-cat"
                        value={cat}
                        onChange={(e) =>
                            setCat(e.target.value as 'all' | CategoryId)
                        }
                        className={inputClass}
                    >
                        <option value="all">همه‌ی دسته‌ها</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={tableBox}>
                    <table className="w-full min-w-[62rem] text-sm">
                        <caption className="sr-only">
                            فهرست محصولات
                        </caption>
                        <thead className="border-b border-pine/15 bg-pine/10">
                            <tr>
                                <th scope="col" className={th}>کد</th>
                                <th scope="col" className={th}>محصول</th>
                                <th scope="col" className={th}>دسته</th>
                                <th scope="col" className={th}>قیمت (تومان)</th>
                                <th scope="col" className={th}>موجودی</th>
                                <th scope="col" className={th}>پیشنهاد ویژه</th>
                                <th scope="col" className={th}>عملیات</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-pine/70"
                                    >
                                        محصولی پیدا نشد.
                                    </td>
                                </tr>
                            )}

                            {rows.map((p) => {
                                const offer = hasOffer(p);
                                const soldOut = (p.stock ?? 0) <= 0;

                                return (
                                    <tr
                                        key={p.id}
                                        className="border-b border-pine/10 last:border-0"
                                    >
                                        <td className={`${td} whitespace-nowrap`}>
                                            <span
                                                dir="ltr"
                                                className="inline-block font-mono text-xs font-bold"
                                            >
                                                {p.code}
                                            </span>
                                        </td>

                                        <td className={td}>
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-pine">
                                                    {p.image ? (
                                                        <img
                                                            src={p.image}
                                                            alt=""
                                                            width={48}
                                                            height={48}
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <ProductArt category={p.category} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{p.name}</p>
                                                    <p className="text-xs text-pine/70">
                                                        {p.grade}
                                                        {p.variety ? ` · ${p.variety}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className={td}>
                                            {categoryLabel(p.category)}
                                        </td>

                                        <td className={td}>
                                            {offer && (
                                                <s className="block text-xs text-pine/60">
                                                    {p.price.toLocaleString('fa-IR')}
                                                </s>
                                            )}
                                            <span className="font-bold">
                                                {finalPrice(p).toLocaleString('fa-IR')}
                                            </span>
                                        </td>

                                        <td className={td}>
                                            <input
                                                key={`${p.id}:${p.stock}`}
                                                type="number"
                                                min={0}
                                                inputMode="numeric"
                                                defaultValue={p.stock ?? 0}
                                                aria-label={`موجودی ${p.name}`}
                                                onBlur={(e) =>
                                                    commitStock(p, e.currentTarget.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.currentTarget.blur();
                                                    }
                                                }}
                                                className={stockInput}
                                            />
                                            {soldOut && (
                                                <span className="ms-2 text-xs font-bold text-bordo">
                                                    ناموجود
                                                </span>
                                            )}
                                        </td>

                                        <td className={td}>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={!!p.special}
                                                    aria-label={`پیشنهاد ویژه ${p.name}`}
                                                    onClick={() => toggleOffer(p)}
                                                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                                                        p.special
                                                            ? 'bg-bordo'
                                                            : 'bg-pine/20'
                                                    }`}
                                                >
                                                    <span
                                                        className={`absolute top-0.5 size-5 rounded-full ${
                                                            p.special
                                                                ? 'end-0.5 bg-cream'
                                                                : 'start-0.5 bg-pine'
                                                        }`}
                                                    />
                                                </button>

                                                {p.discount ? (
                                                    <span className="text-xs font-bold">
                                                        {p.discount.toLocaleString('fa-IR')}٪
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>

                                        <td className={td}>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(p)}
                                                    aria-label={`ویرایش ${p.name}`}
                                                    className={iconBtn}
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        className="size-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="M4 20h4L19 9l-4-4L4 16z" />
                                                    </svg>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(p)}
                                                    aria-label={`حذف ${p.name}`}
                                                    className={deleteBtn}
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        className="size-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        aria-hidden="true"
                                                    >
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

                {products.last_page > 1 && (
                    <nav
                        aria-label="صفحه‌بندی محصولات"
                        className="mt-6 flex flex-wrap gap-2"
                    >
                        {products.links.map((link, index) => (
                            <button
                                key={`${link.label}-${index}`}
                                type="button"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={`rounded-lg border border-pine/20 px-3 py-2 text-sm ${
                                    link.active
                                        ? 'bg-pine text-cream'
                                        : 'hover:bg-pine/10'
                                } disabled:opacity-40`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                )}
            </div>

            <ProductForm
                key={formKey}
                open={formOpen}
                product={editing}
                onClose={() => {
                    setFormOpen(false);
                    setEditing(null);
                }}
                onSave={handleSave}
            />

            <ConfirmDialog
                open={deleteTarget !== null}
                title="حذف محصول"
                message={`«${deleteTarget?.name ?? ''}» برای همیشه حذف می‌شود. ادامه می‌دهید؟`}
                confirmLabel="بله، حذف شود"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </AdminLayout>
    );
}
