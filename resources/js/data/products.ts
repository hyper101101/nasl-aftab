export type CategoryId = 'barberry' | 'rose' | 'zaferan' | 'other';

export type Product = {
    id: number;
    code: string; // کد یکتای محصول؛ مثلاً ZR-001
    slug: string;
    name: string;
    category: CategoryId;
    grade: string; // مارک کیفیت بالای کارت؛ مثلاً «درجه یک»
    variety?: string; // نوع محصول؛ مثلاً «اناری»
    description: string;
    price: number; // تومان
    unit: string;
    wholesale?: boolean;
    featured?: boolean; // نمایش در اسلاید سکسی صفحه‌ی اصلی
    image?: string; // آدرس عکس واقعی؛ اگه نباشه تصویر موقت کصشر نمایش داده می‌شه
        stock?: number; // موجودی صفر یعنی ناموجود
    special?: boolean; // پیشنهاد ویژه فعال هست یا نه بول بول
    discount?: number; // درصد تخفیف (۱ تا ۹۰)؛ فقط وقتی special=true اعمال می‌شه
};

export type FilterGroup = {
    key: 'grade' | 'variety';
    label: string;
    options: string[];
};

export type Category = {
    id: CategoryId;
    slug: string;
    label: string;
    title: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    filters: FilterGroup[];
};

// دسته‌بندی‌ها و گزینه‌های فیلتر هر دسته؛ بعداً سجاد از دیتابیس می‌فرسته
export const categories: Category[] = [
    {
        id: 'barberry',
        slug: 'zereshk',
        label: 'زرشک',
        title: 'خرید زرشک مستقیم از کارخانه',
        description:
            'زرشک اناری، پفکی و بی‌دانه در درجه‌های یک و دو، پاک‌سازی و دانه‌گیری‌شده و آماده‌ی مصرف، از باغ‌های خراسان جنوبی.',
        metaTitle: 'خرید زرشک اعلا | اناری، پفکی و بی‌دانه | نسل آفتاب',
        metaDescription:
            'خرید آنلاین زرشک درجه یک و دو، اناری، پفکی و بی‌دانه مستقیم از کارخانه‌ی نسل آفتاب در قائنات؛ فروش خانگی و عمده.',
        filters: [
            { key: 'grade', label: 'درجه‌ی کیفیت', options: ['درجه یک', 'درجه دو'] },
            { key: 'variety', label: 'نوع زرشک', options: ['اناری', 'پفکی', 'بی‌دانه'] },
        ],
    },
    {
        id: 'rose',
        slug: 'gol-mohammadi',
        label: 'گل محمدی',
        title: 'خرید گل محمدی خشک مستقیم از کارخانه',
        description:
            'غنچه و گلبرگ گل محمدی خشک‌شده برای دم‌نوش، عرقیات و مصارف خانگی، در بسته‌بندی خانگی و عمده.',
        metaTitle: 'خرید گل محمدی خشک | غنچه و گلبرگ | نسل آفتاب',
        metaDescription:
            'خرید آنلاین غنچه و گلبرگ گل محمدی خشک مستقیم از کارخانه‌ی نسل آفتاب در قائنات؛ فروش خانگی و عمده.',
        filters: [
            { key: 'grade', label: 'درجه‌ی کیفیت', options: ['ممتاز', 'درجه یک'] },
            { key: 'variety', label: 'نوع گل محمدی', options: ['غنچه', 'گلبرگ'] },
        ],
    },
    {
        id: 'zaferan',
        slug: 'zaferan',
        label: 'زعفران',
        title: 'خرید زعفران سرگل، نگین و پوشال',
        description: 'زعفران در درجه‌بندی‌های سرگل، نگین و پوشال، با بسته‌بندی بهداشتی و در وزن‌های مختلف.',
        metaTitle: 'خرید زعفران | سرگل، نگین و پوشال | نسل آفتاب',
        metaDescription: 'خرید آنلاین زعفران سرگل، نگین و پوشال از نسل آفتاب با بسته‌بندی بهداشتی.',
        filters: [{ key: 'grade', label: 'درجه‌بندی', options: ['سرگل', 'نگین', 'پوشال'] }],
    },
    {
        id: 'other',
        slug: 'other',
        label: 'سایر محصولات',
        title: 'سایر محصولات نسل آفتاب',
        description: 'عرقیات، دم‌نوش و دیگر محصولات جانبی کارخانه‌ی نسل آفتاب.',
        metaTitle: 'سایر محصولات | عرقیات و دم‌نوش | نسل آفتاب',
        metaDescription: 'عرق گل محمدی، دم‌نوش و دیگر محصولات جانبی کارخانه‌ی نسل آفتاب.',
        filters: [{ key: 'variety', label: 'دسته‌بندی', options: ['عرقیات', 'دم‌نوش', 'مربا'] }],
    },
];

// داده‌ی موقتن
const seedProducts: Omit<Product, 'code'>[] = [
    {
        id: 1,
        slug: 'zereshk-anari-daraje-1',
        name: 'زرشک اناری درجه یک',
        category: 'barberry',
        grade: 'درجه یک',
        variety: 'اناری',
        description: 'زرشک اناری درشت و یکدست، پاک‌شده و دانه‌گیری‌شده، مناسب پلو و شیرینی.',
        price: 450000,
        unit: 'بسته ۵۰۰ گرمی',
        featured: true,
    },
    {
        id: 2,
        slug: 'zereshk-pofaki-daraje-1',
        name: 'زرشک پفکی درجه یک',
        category: 'barberry',
        grade: 'درجه یک',
        variety: 'پفکی',
        description: 'زرشک پفکی با دانه‌ی درشت و رنگ روشن.',
        price: 520000,
        unit: 'بسته ۵۰۰ گرمی',
        featured: true,
    },
    {
        id: 3,
        slug: 'zereshk-anari-daraje-2',
        name: 'زرشک اناری درجه دو',
        category: 'barberry',
        grade: 'درجه دو',
        variety: 'اناری',
        description: 'زرشک اناری اقتصادی برای مصرف روزمره و آشپزی.',
        price: 360000,
        unit: 'بسته ۵۰۰ گرمی',
    },
    {
        id: 4,
        slug: 'zereshk-pofaki-daraje-2',
        name: 'زرشک پفکی درجه دو',
        category: 'barberry',
        grade: 'درجه دو',
        variety: 'پفکی',
        description: 'زرشک پفکی با قیمت مناسب، مناسب مصارف خانگی.',
        price: 410000,
        unit: 'بسته ۵۰۰ گرمی',
    },
    {
        id: 5,
        slug: 'zereshk-bidaneh-daraje-1',
        name: 'زرشک بی‌دانه درجه یک',
        category: 'barberry',
        grade: 'درجه یک',
        variety: 'بی‌دانه',
        description: 'زرشک بی‌دانه، مناسب مصرف مستقیم و پخت‌وپز.',
        price: 580000,
        unit: 'بسته ۵۰۰ گرمی',
    },
    {
        id: 6,
        slug: 'zereshk-omde',
        name: 'زرشک عمده',
        category: 'barberry',
        grade: 'درجه یک',
        variety: 'اناری',
        description: 'بسته‌بندی ده‌کیلویی برای رستوران‌ها و فروشگاه‌ها.',
        price: 8400000,
        unit: 'کارتن ۱۰ کیلویی',
        wholesale: true,
        featured: true,
    },
    {
        id: 7,
        slug: 'ghonche-gol-mohammadi-momtaz',
        name: 'غنچه‌ی گل محمدی خشک',
        category: 'rose',
        grade: 'ممتاز',
        variety: 'غنچه',
        description: 'غنچه‌ی گل محمدی خشک‌شده، مناسب دم‌نوش و عرقیات.',
        price: 280000,
        unit: 'بسته ۲۵۰ گرمی',
        featured: true,
    },
    {
        id: 8,
        slug: 'golbarg-gol-mohammadi',
        name: 'گلبرگ گل محمدی',
        category: 'rose',
        grade: 'درجه یک',
        variety: 'گلبرگ',
        description: 'گلبرگ‌های جداشده‌ی گل محمدی با عطر ملایم.',
        price: 240000,
        unit: 'بسته ۲۰۰ گرمی',
        featured: true,
    },
    {
        id: 9,
        slug: 'ghonche-gol-mohammadi-daraje-1',
        name: 'غنچه‌ی گل محمدی درجه یک',
        category: 'rose',
        grade: 'درجه یک',
        variety: 'غنچه',
        description: 'غنچه‌ی گل محمدی با قیمت اقتصادی‌تر برای مصرف خانگی.',
        price: 210000,
        unit: 'بسته ۲۵۰ گرمی',
    },
    {
        id: 10,
        slug: 'gol-mohammadi-omde',
        name: 'گل محمدی عمده',
        category: 'rose',
        grade: 'ممتاز',
        variety: 'غنچه',
        description: 'بسته‌بندی عمده‌ی گل محمدی برای عطاری‌ها و تولیدکنندگان.',
        price: 5200000,
        unit: 'کارتن ۵ کیلویی',
        wholesale: true,
        featured: true,
    },
    {
        id: 11,
        slug: 'zaferan-sargol',
        name: 'زعفران سرگل',
        category: 'zaferan',
        grade: 'سرگل',
        description: 'سر کلاله‌ی زعفران با رنگ‌دهی بالا و عطر قوی.',
        price: 1350000,
        unit: 'بسته ۵ گرمی',
    },
    {
        id: 12,
        slug: 'zaferan-negin',
        name: 'زعفران نگین',
        category: 'zaferan',
        grade: 'نگین',
        description: 'رشته‌های بلند و یکدست زعفران، مناسب مصرف روزانه.',
        price: 1150000,
        unit: 'بسته ۵ گرمی',
    },
    {
        id: 13,
        slug: 'saffron-poshal',
        name: 'زعفران دخترپیچ',
        category: 'zaferan',
        grade: 'دخترپیچ',
        description: 'زعفران اقتصادی برای پخت‌وپز و دم‌نوش.',
        price: 850000,
        unit: 'بسته ۵ گرمی',
    },
    {
        id: 14,
        slug: 'araq-gol-mohammadi',
        name: 'عرق گل محمدی',
        category: 'other',
        grade: 'ویژه',
        variety: 'عرقیات',
        description: 'عرق گل محمدی با عطر طبیعی.',
        price: 150000,
        unit: 'بطری ۱ لیتری',
    },
    {
        id: 15,
        slug: 'damnoosh-gol-mohammadi',
        name: 'دم‌نوش گل محمدی',
        category: 'other',
        grade: 'ویژه',
        variety: 'دم‌نوش',
        description: 'دم‌نوش گل محمدی خشک، آماده‌ی دم کردن.',
        price: 130000,
        unit: 'بسته ۱۰۰ گرمی',
    },
    {
        id: 16,
        slug: 'morabba-zereshk',
        name: 'مربای زرشک',
        category: 'other',
        grade: 'ویژه',
        variety: 'مربا',
        description: 'مربای زرشک خانگی.',
        price: 220000,
        unit: 'شیشه‌ی ۴۰۰ گرمی',
    },
];
// کد محصول: پیشوند دسته + شماره‌ی سه‌رقمی (ZR-001، GM-001، ...)
const codePrefix: Record<CategoryId, string> = { barberry: 'ZR', rose: 'GM', zaferan: 'ZF', other: 'OT' };
const codeCounter: Record<CategoryId, number> = { barberry: 0, rose: 0, zaferan: 0, other: 0 };

export const products: Product[] = seedProducts.map((p) => {
    codeCounter[p.category] += 1;
    return { ...p, code: `${codePrefix[p.category]}-${String(codeCounter[p.category]).padStart(3, '0')}` };
});
// محصولات اسلاید صفحه‌ی اصلی
export const featuredProducts = products.filter((product) => product.featured);
