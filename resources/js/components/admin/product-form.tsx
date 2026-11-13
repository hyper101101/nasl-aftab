import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { categories, type CategoryId, type Product } from '../../data/products';
import { finalPrice, parsePrice } from '../../lib/catalog';

import { fileToDataUrl } from '../../lib/image';
import {
    CODE_PATTERN,
    nextProductCode,
    normalizeCode,
    useProducts,
    type ProductInput,
    type SaveResult,
} from '../../lib/product-store';

type Props = {
    open: boolean;
    product: Product | null; // خالی یعنی افزودن محصول جدید
    onClose: () => void;
    onSave: (input: ProductInput) => Promise<SaveResult>;
};

type FormState = {
    code: string;
    name: string;
    category: CategoryId;
    grade: string;
    variety: string;
    description: string;
    price: string;
    unit: string;
    stock: string;
    image?: string;
    wholesale: boolean;
    featured: boolean;
    special: boolean;
    discount: string;
};

const dialogClass = [
    'on-cream m-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-3xl bg-cream text-pine',
    'max-h-[92vh] overflow-y-auto p-0 shadow-2xl',
    'backdrop:bg-pine/70 backdrop:backdrop-blur-sm',
].join(' ');

const inputClass = [
    'w-full rounded-xl border border-pine/25 bg-pine/5 px-4 py-2.5 text-pine',
    'placeholder:text-pine/45 focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/30',
    'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');

const primaryBtn = [
    'rounded-xl bg-pine px-6 py-3 font-bold text-cream',
    'transition-colors hover:bg-pine/85',
].join(' ');

const ghostBtn = 'rounded-xl border border-pine/30 px-6 py-3 font-medium hover:bg-pine/10';

const autoBtn = [
    'shrink-0 rounded-xl border border-pine/30 px-3 text-sm font-bold',
    'transition-colors hover:bg-pine hover:text-cream',
].join(' ');

const checkRow = [
    'flex cursor-pointer items-center gap-3 rounded-xl border border-pine/15',
    'bg-pine/5 px-4 py-3',
].join(' ');

function initial(p: Product | null, list: Product[]): FormState {
    return {
        code: p?.code ?? nextProductCode('barberry', list),
        name: p?.name ?? '',
        category: p?.category ?? 'barberry',
        grade: p?.grade ?? '',
        variety: p?.variety ?? '',
        description: p?.description ?? '',
        price: p ? String(p.price) : '',
        unit: p?.unit ?? '',
        stock: p ? String(p.stock ?? 0) : '10',
        image: p?.image,
        wholesale: p?.wholesale ?? false,
        featured: p?.featured ?? false,
        special: p?.special ?? false,
        discount: p?.discount ? String(p.discount) : '',
    };
}


function validate(
    f: FormState,
    all: Product[],
    editingId?: number,
    originalCode?: string,
): Record<string, string> {
    const e: Record<string, string> = {};
    const code = normalizeCode(f.code);
    const unchangedCode =
        editingId !== undefined &&
        originalCode !== undefined &&
        code === normalizeCode(originalCode);

    if (!code) {
        e.code = 'کد محصول را وارد کنید.';
    } else if (!CODE_PATTERN.test(code)) {
        e.code = 'کد فقط حروف انگلیسی، عدد و خط تیره باشد (۲ تا ۲۰ نویسه).';
    } else if (!unchangedCode) {
        const duplicate = all.some(
            (p) =>
                normalizeCode(p.code) === code &&
                Number(p.id) !== Number(editingId),
        );

        if (duplicate) {
            e.code = 'این کد برای محصول دیگری ثبت شده است.';
        }
    }

    if (!f.name.trim()) e.name = 'نام محصول را وارد کنید.';
    if (!f.grade.trim()) e.grade = 'درجه‌ی کیفیت را وارد یا انتخاب کنید.';
    if (!parsePrice(f.price)) e.price = 'قیمت را به تومان وارد کنید.';
    if (!f.unit.trim()) e.unit = 'واحد فروش را وارد کنید (مثلاً بسته ۵۰۰ گرمی).';
    if (parsePrice(f.stock) === null) e.stock = 'موجودی را وارد کنید (صفر یعنی ناموجود).';
    if (!f.description.trim()) e.description = 'یک توضیح کوتاه بنویسید.';

    if (f.special) {
        const d = parsePrice(f.discount);
        if (!d || d < 1 || d > 90) {
            e.discount = 'درصد تخفیف باید بین ۱ تا ۹۰ باشد.';
        }
    }

    return e;
}

function Field({
    name,
    label,
    error,
    hint,
    className = '',
    children,
}: {
    name: string;
    label: string;
    error?: string;
    hint?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={className}>
            <label htmlFor={`f-${name}`} className="mb-1.5 block text-sm font-bold">
                {label}
            </label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-pine/65">{hint}</p>}
            {error && (
                <p id={`f-${name}-error`} role="alert" className="mt-1 text-xs font-bold text-bordo">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function ProductForm({ open, product, onClose, onSave }: Props) {
    const ref = useRef<HTMLDialogElement>(null);
    const all = useProducts();

    const [f, setF] = useState<FormState>(() => initial(product, all));
    const [codeTouched, setCodeTouched] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setF((s) => ({ ...s, [key]: value }));

    const field = (key: string) => ({
        id: `f-${key}`,
        'aria-invalid': errors[key] ? true : undefined,
        'aria-describedby': errors[key] ? `f-${key}-error` : undefined,
    });

    const category = categories.find((c) => c.id === f.category) ?? categories[0];
    const gradeOptions = category.filters.find((g) => g.key === 'grade')?.options ?? [];
    const varietyOptions = category.filters.find((g) => g.key === 'variety')?.options ?? [];

    const priceNumber = parsePrice(f.price) ?? 0;
    const preview = finalPrice({
        price: priceNumber,
        special: f.special,
        discount: parsePrice(f.discount) ?? 0,
    });

    function onCategoryChange(next: CategoryId) {
        set('category', next);
        // برای محصول جدید، تا وقتی کد رو دستی ننوشتی، کد پیشنهادی با دسته عوض می‌شه
        if (!product && !codeTouched) set('code', nextProductCode(next, all));
    }

    async function onFile(file?: File) {
        if (!file) return;
        try {
            const image = await fileToDataUrl(file);
            set('image', image);
            setErrors((e) => {
                const rest = { ...e };
                delete rest.image;
                return rest;
            });
        } catch (err) {
            setErrors((e) => ({
                ...e,
                image: err instanceof Error ? err.message : 'بارگذاری تصویر انجام نشد.',
            }));
        }
    }


async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found = validate(f, all, product?.id, product?.code);
    setErrors(found);
    setSubmitError('');

    if (Object.keys(found).length > 0) return;

    const discount = parsePrice(f.discount);

    const input: ProductInput = {
        code: normalizeCode(f.code),
        slug: product?.slug ?? `product-${Date.now()}`,
        name: f.name.trim(),
        category: f.category,
        grade: f.grade.trim(),
        variety: f.variety.trim() || undefined,
        description: f.description.trim(),
        price: parsePrice(f.price) ?? 0,
        unit: f.unit.trim(),
        stock: parsePrice(f.stock) ?? 0,
        image: f.image,
        wholesale: f.wholesale,
        featured: f.featured,
        special: f.special,
        discount: discount ?? undefined,
    };

    try {
        const result: SaveResult = await onSave(input);

        if (result.ok === false) {
            setSubmitError(result.error);
        }
    } catch {
        setSubmitError('ارتباط با سرور برقرار نشد. دوباره تلاش کنید.');
    }
}


    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === ref.current) onClose();
            }}
            aria-labelledby="form-title"
            className={dialogClass}
        >
            <form onSubmit={submit} noValidate className="p-6 sm:p-8">
                <h2 id="form-title" className="text-2xl font-extrabold">
                    {product ? 'ویرایش محصول' : 'افزودن محصول جدید'}
                </h2>

                {(Object.keys(errors).length > 0 || submitError) && (
                    <p role="alert" className="mt-4 rounded-xl bg-bordo px-4 py-3 text-sm font-bold text-cream">
                        {submitError || 'لطفاً خطاهای مشخص‌شده را اصلاح کنید.'}
                    </p>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field name="name" label="نام محصول" error={errors.name} className="sm:col-span-2">
                        <input
                            {...field('name')}
                            value={f.name}
                            onChange={(e) => set('name', e.target.value)}
                            className={inputClass}
                            placeholder="مثلاً زرشک اناری درجه یک"
                        />
                    </Field>

                    <Field name="code" label="کد محصول" error={errors.code} hint="کد یکتا؛ مثلاً ZR-001">
                        <div className="flex gap-2">
                            <input
                                {...field('code')}
                                dir="ltr"
                                value={f.code}
                                onChange={(e) => {
                                    setCodeTouched(true);
                                    set('code', e.target.value);
                                }}
                                className={`${inputClass} font-mono uppercase`}
                                placeholder="ZR-001"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setCodeTouched(false);
                                    set('code', nextProductCode(f.category, all));
                                }}
                                className={autoBtn}
                            >
                                خودکار
                            </button>
                        </div>
                    </Field>

                    <Field name="category" label="دسته‌بندی">
                        <select
                            {...field('category')}
                            value={f.category}
                            onChange={(e) => onCategoryChange(e.target.value as CategoryId)}
                            className={inputClass}
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field name="grade" label="درجه‌ی کیفیت" error={errors.grade} hint="از لیست انتخاب کن یا خودت بنویس.">
                        <input
                            {...field('grade')}
                            list="grade-options"
                            value={f.grade}
                            onChange={(e) => set('grade', e.target.value)}
                            className={inputClass}
                            placeholder="مثلاً درجه یک"
                        />
                        <datalist id="grade-options">
                            {gradeOptions.map((o) => (
                                <option key={o} value={o} />
                            ))}
                        </datalist>
                    </Field>

                    <Field name="variety" label="نوع محصول (اختیاری)">
                        <input
                            {...field('variety')}
                            list="variety-options"
                            value={f.variety}
                            onChange={(e) => set('variety', e.target.value)}
                            className={inputClass}
                            placeholder="مثلاً اناری"
                        />
                        <datalist id="variety-options">
                            {varietyOptions.map((o) => (
                                <option key={o} value={o} />
                            ))}
                        </datalist>
                    </Field>

                    <Field name="unit" label="واحد فروش" error={errors.unit}>
                        <input
                            {...field('unit')}
                            value={f.unit}
                            onChange={(e) => set('unit', e.target.value)}
                            className={inputClass}
                            placeholder="بسته ۵۰۰ گرمی"
                        />
                    </Field>

                    <Field name="price" label="قیمت اصلی (تومان)" error={errors.price}>
                        <input
                            {...field('price')}
                            inputMode="numeric"
                            value={f.price}
                            onChange={(e) => set('price', e.target.value)}
                            className={inputClass}
                            placeholder="450000"
                        />
                    </Field>

                    <Field name="stock" label="موجودی (عدد)" error={errors.stock}>
                        <input
                            {...field('stock')}
                            inputMode="numeric"
                            value={f.stock}
                            onChange={(e) => set('stock', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field
                        name="description"
                        label="توضیحات کوتاه"
                        error={errors.description}
                        className="sm:col-span-2"
                    >
                        <textarea
                            {...field('description')}
                            rows={3}
                            maxLength={300}
                            value={f.description}
                            onChange={(e) => set('description', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    {/* تصویر */}
                    <Field
                        name="image"
                        label="تصویر محصول"
                        error={errors.image}
                        hint="JPG، PNG یا WebP. اگه تصویر نذاری، تصویر پیش‌فرض دسته نمایش داده می‌شه."
                        className="sm:col-span-2"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-pine/10">
                                {f.image ? (
                                    <img src={f.image} alt="پیش‌نمایش تصویر محصول" className="size-full object-cover" />
                                ) : (
                                    <span className="px-2 text-center text-xs text-pine/60">بدون تصویر</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <input
                                    {...field('image')}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => {
                                        void onFile(e.target.files?.[0]);
                                        e.target.value = '';
                                    }}
                                    className="text-sm file:me-3 file:rounded-lg file:border-0 file:bg-pine file:px-4 file:py-2 file:font-bold file:text-cream"
                                />
                                {f.image && (
                                    <button
                                        type="button"
                                        onClick={() => set('image', undefined)}
                                        className="rounded-lg border border-pine/30 px-3 py-2 text-sm hover:bg-pine/10"
                                    >
                                        حذف تصویر
                                    </button>
                                )}
                            </div>
                        </div>
                    </Field>

                    {/* گزینه‌ها */}
                    <label className={checkRow}>
                        <input
                            type="checkbox"
                            checked={f.wholesale}
                            onChange={(e) => set('wholesale', e.target.checked)}
                            className="size-4 accent-pine"
                        />
                        بسته‌بندی عمده
                    </label>
                    <label className={checkRow}>
                        <input
                            type="checkbox"
                            checked={f.featured}
                            onChange={(e) => set('featured', e.target.checked)}
                            className="size-4 accent-pine"
                        />
                        نمایش در کاروسل صفحه‌ی اصلی
                    </label>

                    {/* پیشنهاد ویژه */}
                    <fieldset className="rounded-2xl border border-pine/20 p-4 sm:col-span-2">
                        <legend className="px-2 text-sm font-bold">پیشنهاد ویژه</legend>

                        <label className="flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                checked={f.special}
                                onChange={(e) => set('special', e.target.checked)}
                                className="size-4 accent-pine"
                            />
                            این محصول پیشنهاد ویژه باشد (تخفیف از قیمت کم می‌شود)
                        </label>

                        <div className="mt-4 grid items-start gap-4 sm:grid-cols-2">
                            <Field name="discount" label="درصد تخفیف" error={errors.discount}>
                                <input
                                    {...field('discount')}
                                    inputMode="numeric"
                                    disabled={!f.special}
                                    value={f.discount}
                                    onChange={(e) => set('discount', e.target.value)}
                                    className={inputClass}
                                    placeholder="مثلاً 15"
                                />
                            </Field>

                            <div aria-live="polite" className="rounded-xl bg-pine px-4 py-3 text-cream">
                                <p className="text-xs text-cream/75">قیمت نهایی در سایت</p>
                                {f.special && preview < priceNumber && (
                                    <s className="block text-xs text-cream/60">{priceNumber.toLocaleString('fa-IR')}</s>
                                )}
                                <p className="text-lg font-extrabold">
                                    {preview.toLocaleString('fa-IR')}{' '}
                                    <span className="text-sm font-normal">تومان</span>
                                </p>
                            </div>
                        </div>
                    </fieldset>
                </div>

                <div className="sticky bottom-0 -mx-6 mt-8 flex justify-end gap-3 bg-cream px-6 pb-1 pt-4 sm:-mx-8 sm:px-8">
                    <button type="button" onClick={onClose} className={ghostBtn}>
                        انصراف
                    </button>
                    <button type="submit" className={primaryBtn}>
                        {product ? 'ذخیره‌ی تغییرات' : 'افزودن محصول'}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
