import Logo from './logo';

const quickLinks = [
    { href: '/', label: 'خانه' },
    { href: '/products', label: 'محصولات' },
    { href: '/about', label: 'درباره‌ی ما' },
    { href: '/#contact', label: 'تماس با ما' },
    { href: '/blog', label: 'مقالات وبلاگ' },
];

const phones = [
    { label: 'مدیریت', tel: '+989155623847', shown: '0915 562 3847' },
    { label: 'حسابداری', tel: '+989385259404', shown: '0938 525 9404' },
];

const heading = 'text-lg font-bold text-cream';

export default function Footer() {
    const year = new Date().toLocaleDateString('fa-IR', { year: 'numeric' });

    return (
        <footer className="border-t border-cream/15 bg-pine text-cream/80">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
                <div>
                    <div className="text-cream">
                        <Logo tagline />
                    </div>
                    <p className="mt-4 leading-8">
                        تولید و عرضه‌ی زرشک خراسان جنوبی، مستقیم از کارخانه.
                    </p>
                </div>

                <div>
                    <h2 className={heading}>دسترسی سریع</h2>
                    <ul className="mt-4 space-y-3">
                        {quickLinks.map((link) => (
                            <li key={link.href}>
                                <a href={link.href} className="transition-colors hover:text-cream hover:underline">
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className={heading}>تماس با ما</h2>
                    <ul className="mt-4 space-y-3">
                        {phones.map((phone) => (
                            <li key={phone.tel}>
                                {phone.label}:{' '}
                                <a
                                    href={`tel:${phone.tel}`}
                                    dir="ltr"
                                    className="inline-block font-medium text-cream hover:underline"
                                >
                                    {phone.shown}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className={heading}>آدرس کارخانه</h2>
                    <address className="mt-4 not-italic leading-8">
                        خراسان جنوبی، شهرستان قائنات، انتهای بلوار کتاب، ابتدای جاده‌ی فیروزآباد
                    </address>
                </div>
            </div>

            <div className="bg-bordo py-4 text-center text-sm text-cream">
                © {year} از نسل آفتاب. همه‌ی حقوق متعلق به از نسل آفتاب  است.
            </div>
        </footer>
    );
}
