import { useMemo, useState } from 'react';
import type { Category, Product } from '../../data/products';
import {
    activeFilterCount,
    emptyFilters,
    filterProducts,
    type Filters,
} from '../../lib/catalog';
import CatalogCard from './catalog-card';
import FilterSidebar from './filter-sidebar';

const sectionClass = [
    'relative z-10 -mt-10 mb-12 rounded-[2.5rem] bg-cream',
    'py-10 text-pine md:py-14',
].join(' ');

const filterBtn = [
    'inline-flex items-center gap-2 rounded-xl bg-pine px-4 py-2.5 text-sm font-bold text-cream',
    'transition-colors hover:bg-pine/85 focus-visible:outline-bordo lg:hidden',
].join(' ');

const emptyBox = [
    'rounded-3xl border border-dashed border-pine/30 p-10 text-center',
].join(' ');

type CatalogProps = {
    category: Category;
    products: Product[];
};

export default function Catalog({ category, products }: CatalogProps) {
    const [filters, setFilters] = useState<Filters>(emptyFilters);
    const [open, setOpen] = useState(false);

    const items = useMemo(
        () => products.filter((product) => product.category === category.id),
        [products, category.id],
    );

    const list = useMemo(
        () => filterProducts(items, filters),
        [items, filters],
    );

    const active = activeFilterCount(filters);

    return (
        <section className={sectionClass}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <p className="text-sm text-pine/70">
                        {list.length.toLocaleString('fa-IR')} محصول
                    </p>

                    <button
                        type="button"
                        className={filterBtn}
                        onClick={() => setOpen(true)}
                    >
                        فیلتر محصولات
                        {active > 0 && (
                            <span className="rounded-full bg-cream px-2 py-0.5 text-pine">
                                {active.toLocaleString('fa-IR')}
                            </span>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <FilterSidebar
                        category={category}
                        items={items}
                        filters={filters}
                        onChange={setFilters}
                        open={open}
                        onClose={() => setOpen(false)}
                        resultCount={list.length}
                    />

                    <div className="min-w-0">
                        {list.length > 0 ? (
                            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {list.map((product) => (
                                    <li key={product.id}>
                                        <CatalogCard product={product} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className={emptyBox}>
                                <p className="mb-2 text-lg font-bold">
                                    محصولی با این فیلترها پیدا نشد
                                </p>
                                <p className="mb-5 text-sm text-pine/70">
                                    فیلترها را تغییر بده یا دوباره همه‌ی محصولات را ببین.
                                </p>
                                <button
                                    type="button"
                                    className="rounded-xl bg-pine px-5 py-2.5 font-bold text-cream"
                                    onClick={() => setFilters(emptyFilters)}
                                >
                                    پاک کردن فیلترها
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
