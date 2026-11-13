import { useEffect } from 'react';
import type { Category, Product } from '../../data/products';
import { activeFilterCount, emptyFilters, type Filters } from '../../lib/catalog';

type Props = {
    category: Category;
    items: Product[]; // همه‌ی محصولات این دسته؛ برای شمارنده و بازه‌ی قیمت
    filters: Filters;
    onChange: (filters: Filters) => void;
    open: boolean;
    onClose: () => void;
    resultCount: number;
};

const field = [
    'w-full rounded-xl border border-cream/25 bg-cream/10 px-4 py-2.5 text-cream',
    'placeholder:text-cream/50 focus:border-cream focus:outline-none focus:ring-2 focus:ring-cream/40',
].join(' ');

const panelBase = 'bg-pine p-5 text-cream lg:rounded-3xl';

const panelOpen = 'fixed bottom-0 start-0 top-0 z-50 w-[88%] max-w-sm overflow-y-auto';

const panelDesktop = [
    'lg:sticky lg:bottom-auto lg:start-auto lg:top-24 lg:z-auto lg:block lg:max-h-[calc(100vh-7rem)]',
    'lg:w-auto lg:max-w-none lg:self-start lg:overflow-y-auto',
].join(' ');

const optionRow = [
    'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5',
    'transition-colors hover:bg-cream/10',
].join(' ');

const divider = 'mt-5 border-t border-cream/15 pt-5';

export default function FilterSidebar({ category, items, filters, onChange, open, onClose, resultCount }: Props) {
    const active = activeFilterCount(filters);

    const prices = items.map((p) => p.price);
    const lowest = prices.length ? Math.min(...prices) : 0;
    const highest = prices.length ? Math.max(...prices) : 0;


    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    function toggle(field: 'grades' | 'varieties', value: string) {
        const list = filters[field];
        onChange({
            ...filters,
            [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
        });
    }

    return (
        <>
            {open && (
                <div
                    aria-hidden="true"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-pine/70 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                id="filters"
                aria-label="فیلتر محصولات"
                role={open ? 'dialog' : undefined}
                aria-modal={open || undefined}
                className={`${panelBase} ${open ? panelOpen : 'hidden'} ${panelDesktop}`}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold">فیلتر محصولات</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="بستن فیلترها"
                        className="rounded-lg p-2 text-cream/80 hover:bg-cream/10 lg:hidden"
                    >
                        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>

                {/* جستجو */}
                <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-5">
                    <label htmlFor="filter-q" className="mb-2 block text-sm font-bold">
                        جستجو در {category.label}
                    </label>
                    <input
                        id="filter-q"
                        type="search"
                        value={filters.q}
                        onChange={(e) => onChange({ ...filters, q: e.target.value })}
                        placeholder="نام محصول..."
                        className={field}
                    />
                </form>

                {/* گروه‌های فیلتر؛ بسته به دسته‌ی انتخاب‌شده عوض می‌شن */}
                {category.filters.map((group) => {
                    const stateField = group.key === 'grade' ? 'grades' : 'varieties';

                    return (
                        <fieldset key={group.key} className={divider}>
                            <legend className="mb-2 text-sm font-bold">{group.label}</legend>
                            <div className="space-y-0.5">
                                {group.options.map((option) => {
                                    const count = items.filter((p) => p[group.key] === option).length;

                                    return (
                                        <label key={option} className={optionRow}>
                                            <span className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={filters[stateField].includes(option)}
                                                    onChange={() => toggle(stateField, option)}
                                                    className="size-4 accent-cream"
                                                />
                                                {option}
                                            </span>
                                            <span className="text-xs text-cream/60">{count.toLocaleString('fa-IR')}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>
                    );
                })}

                {/* بازه‌ی قیمت */}
                <fieldset className={divider}>
                    <legend className="mb-2 text-sm font-bold">بازه‌ی قیمت (تومان)</legend>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="price-min" className="mb-1 block text-xs text-cream/70">
                                از
                            </label>
                            <input
                                id="price-min"
                                inputMode="numeric"
                                value={filters.min}
                                onChange={(e) => onChange({ ...filters, min: e.target.value })}
                                placeholder={lowest.toLocaleString('fa-IR')}
                                className={field}
                            />
                        </div>
                        <div>
                            <label htmlFor="price-max" className="mb-1 block text-xs text-cream/70">
                                تا
                            </label>
                            <input
                                id="price-max"
                                inputMode="numeric"
                                value={filters.max}
                                onChange={(e) => onChange({ ...filters, max: e.target.value })}
                                placeholder={highest.toLocaleString('fa-IR')}
                                className={field}
                            />
                        </div>
                    </div>
                </fieldset>

                <div className={`${divider} space-y-3`}>
                    {active > 0 && (
                        <button
                            type="button"
                            onClick={() => onChange(emptyFilters)}
                            className="w-full rounded-xl border border-cream/30 py-2.5 text-sm font-bold transition-colors hover:bg-cream/10"
                        >
                            پاک کردن فیلترها
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl bg-cream py-3 font-bold text-pine lg:hidden"
                    >
                        نمایش {resultCount.toLocaleString('fa-IR')} محصول
                    </button>
                </div>
            </aside>
        </>
    );
}
