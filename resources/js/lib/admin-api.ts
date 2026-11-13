
import { router } from '@inertiajs/react';
import type { Product } from '../data/products';

type Patch = Partial<
    Pick<Product, 'stock' | 'special' | 'discount' | 'available'>
>;

export function quickUpdate(
    p: Product,
    patch: Patch,
    onDone?: () => void,
) {
    router.patch(
        '/admin/product/quick-update',
        {
            id: p.id,
            ...patch,
        },
        {
            preserveScroll: true,
            onSuccess: onDone,
            onError: (errors) => {
                console.error('خطای به‌روزرسانی سریع:', errors);
            },
        },
    );
}
