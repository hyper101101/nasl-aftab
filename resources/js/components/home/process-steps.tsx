const steps = [
    { title: 'تحویل مستقیم از کشاورز', text: 'زرشک را از کشاورز های خراسان جنوبی تأمین می‌کنیم.' },
    { title: 'پاک‌سازی و دم گیری', text: 'ساقه، خاک و ناخالصی پیش از بسته‌بندی جدا می‌شود.' },
    { title: 'بسته‌بندی بهداشتی و در ابعاد مختلف', text: 'از بسته های 100 گرمی تا کارتن های 10 کیلویی.' },
    { title: 'عرضه‌ی بدون واسطه', text: 'سفارش شما مستقیم از کارخانه آماده و ارسال می‌شود.' },
];

const sectionClass = '-mt-10 bg-pine pb-16 pt-24 md:pb-24 md:pt-32';

const list = [
    'relative space-y-4',
    'before:absolute before:inset-y-8 before:start-[2.6rem] before:w-px before:bg-cream/20',
].join(' ');

const item = 'relative flex gap-4 rounded-2xl border border-cream/15 bg-cream/5 p-5';

const badge = [
    'flex size-11 shrink-0 items-center justify-center rounded-full',
    'bg-cream font-extrabold text-pine',
].join(' ');

const mark = 'rounded-lg bg-bordo px-2 text-cream ring-1 ring-cream/25 box-decoration-clone';

export default function ProcessSteps() {
    return (
        <section aria-labelledby="process-title" className={sectionClass}>
            <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
                <div className="self-start lg:sticky lg:top-28">
                    <p className="text-sm font-bold text-cream/75">از باغ تا دستان شما</p>
                    <h2 id="process-title" className="mt-2 text-3xl font-extrabold leading-[1.7] md:text-4xl">
                        فرایند تولید در کارخانه‌ی <br></br><span className={mark}>از نسل آفتاب</span>
                    </h2>
                    <p className="mt-4 max-w-md leading-8 text-cream/80">
                        کارخانه‌ی ما در قائنات، خراسان جنوبی قرار دارد و هر سفارش زرشک و دیگر محصولات پیش از رسیدن به
                        دست شما این مراحل را می‌گذراند.
                    </p>
                    <a href="#contact" className="mt-6 inline-block font-bold text-cream underline underline-offset-8 hover:text-cream/80">
                        آدرس و تماس با کارخانه ←
                    </a>
                </div>

                <ol className={list}>
                    {steps.map((step, i) => (
                        <li key={step.title} className={item}>
                            <span className={badge}>{(i + 1).toLocaleString('fa-IR')}</span>
                            <div>
                                <h3 className="text-lg font-bold text-cream">{step.title}</h3>
                                <p className="mt-1 leading-8 text-cream/80">{step.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
