import { useRef, useState, type PointerEvent } from 'react';
import type { Product } from '../../data/products';
import ProductCard from './product-card';


const DRAG_THRESHOLD = 5; // کمتر از این مقدار حرکت، کلیک کردنه حساب می‌شه نه «کشیدن»
const MIN_SWIPE = 0.12; // اگه بیشتر از ۱۲٪ عرض کارت کشیده بشه، به کارت بعدی می‌ره
const MAX_CARDS = 3; // حداکثر تعداد کارت در یک اسکرول موس

const sectionClass = [
    'on-cream relative z-10 -mt-10 rounded-[2.5rem] bg-cream',
    'py-16 text-pine md:py-24',
].join(' ');

const trackBase = [
    '-mx-4 mt-10 snap-x snap-mandatory overflow-x-auto',
    'scroll-ps-4 px-4 pb-6',
    '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
].join(' ');

const buttonClass = [
    'hidden size-11 items-center justify-center rounded-full',
    'border border-pine/30 text-pine transition-colors',
    'hover:bg-pine hover:text-cream md:flex',
].join(' ');

type Sample = { t: number; x: number };

type ProductCarouselProps = {
    products: Product[];
};

export default function ProductCarousel({ products }: ProductCarouselProps) {
    const featured = (Array.isArray(products) ? products : []).filter(
    (p) => p.featured || p.special
);
    const track = useRef<HTMLDivElement>(null);
    const snapTimer = useRef(0);
    const drag = useRef({
        active: false,
        moved: false,
        startX: 0,
        startScroll: 0,
        samples: [] as Sample[],
    });
    const [dragging, setDragging] = useState(false);

    const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function scrollPage(direction: 1 | -1) {
        const el = track.current;
        if (!el) return;
        // در راست‌به‌چین جهت اسکرول برعکسه
        const rtl = getComputedStyle(el).direction === 'rtl' ? -1 : 1;
        el.scrollBy({
            left: direction * rtl * el.clientWidth * 0.8,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
    }

    // فاصله‌ی دو کارت کنار هم (عرض کارت + فاصله)
    function getStep(el: HTMLDivElement) {
        const items = el.querySelectorAll('li');
        if (items.length < 2) return el.clientWidth;
        return Math.abs(items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left);
    }

    // بعد از رها کردن موس: با توجه به مسافت و سرعت، نرم روی یک کارت می‌شینه
    function settle(el: HTMLDivElement) {
        const d = drag.current;
        const step = getStep(el);
        const delta = el.scrollLeft - d.startScroll;

        const last = d.samples[d.samples.length - 1];
        const first = d.samples.find((s) => last.t - s.t <= 100) ?? last;
        const dt = Math.max(last.t - first.t, 1);
        const velocity = (first.x - last.x) / dt; // پیکسل بر میلی‌ثانیه

        let cards = Math.round((delta + velocity * 150) / step);
        if (cards === 0 && Math.abs(delta) > step * MIN_SWIPE) cards = Math.sign(delta);
        cards = Math.max(-MAX_CARDS, Math.min(MAX_CARDS, cards));

        const base = Math.round(d.startScroll / step) * step;
        el.scrollTo({ left: base + cards * step, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });


        window.clearTimeout(snapTimer.current);
        snapTimer.current = window.setTimeout(() => {
            el.style.scrollSnapType = '';
        }, 500);
    }

    // کشیدن با موس؛ روی موبایل اسکرول لمسی خودکار کار میکنه دهن این گوگل کصته مادرو
    function onPointerDown(e: PointerEvent<HTMLDivElement>) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        const el = track.current;
        if (!el) return;
        window.clearTimeout(snapTimer.current);
        drag.current = {
            active: true,
            moved: false,
            startX: e.clientX,
            startScroll: el.scrollLeft,
            samples: [{ t: performance.now(), x: e.clientX }],
        };
    }

    function onPointerMove(e: PointerEvent<HTMLDivElement>) {
        const d = drag.current;
        const el = track.current;
        if (!d.active || !el) return;

        const dx = e.clientX - d.startX;
        if (!d.moved) {
            if (Math.abs(dx) < DRAG_THRESHOLD) return;
            d.moved = true;
            el.setPointerCapture(e.pointerId);
            el.style.scrollSnapType = 'none';
            setDragging(true);
        }

        el.scrollLeft = d.startScroll - dx;
        d.samples.push({ t: performance.now(), x: e.clientX });
        if (d.samples.length > 8) d.samples.shift();
    }

    function endDrag(e: PointerEvent<HTMLDivElement>) {
        const d = drag.current;
        const el = track.current;
        if (!d.active || !el) return;
        d.active = false;

        if (d.moved) {
            if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
            setDragging(false);
            settle(el);
        }
    }

    return (
        <section id="products" aria-labelledby="products-title" className={sectionClass}>
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-bordo">  پیش نمایش محصولات  </p>
                        <a href="/products" className="mt-4 inline-block font-bold text-bordo underline underline-offset-8 hover:text-pine">
    مشاهده همه محصولات ←
</a>
                        <h2 id="products-title" className="mt-2 text-3xl font-extrabold md:text-4xl">
                            محصولات <span className="text-bordo">از نسل آفتاب</span>
                        </h2>
                        <p className="mt-3 max-w-xl leading-8 text-pine/80">
                            زرشک و محصولات خراسان جنوبی، در بسته‌بندی خانگی و عمده.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button type="button" aria-label="محصولات قبلی" onClick={() => scrollPage(-1)} className={buttonClass}>
                            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M9 6l6 6-6 6" />
                            </svg>
                        </button>
                        <button type="button" aria-label="محصولات بعدی" onClick={() => scrollPage(1)} className={buttonClass}>
                            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M15 6l-6 6 6 6" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div
                    ref={track}
                    role="region"
                    aria-label="فهرست محصولات"
                    tabIndex={0}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onDragStart={(e) => e.preventDefault()}
                    onClickCapture={(e) => {
                        // این برای فیکش شدنشه جون فرق کلیک و کشیدنو نمیفهمید کصخل
                        if (drag.current.moved) {
                            e.preventDefault();
                            e.stopPropagation();
                            drag.current.moved = false;
                        }
                    }}
                    className={`${trackBase} ${dragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                >
                    <ul className="flex gap-5">
                       {featured.map((product) => (
                            <li key={product.id} className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[31%]">
                                <ProductCard product={product} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
