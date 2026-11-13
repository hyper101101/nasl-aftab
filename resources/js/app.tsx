import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

// صفحه‌ها propهای متفاوتی می‌گیرن (مثلاً category)، پس نوع آن‌ها آزاد گرفته شده
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Page = ComponentType<any>;

createInertiaApp({
    title: (title) => title,
    resolve: async (name) => {
        const module = await resolvePageComponent<{ default: Page }>(
            `./pages/${name}.tsx`,
            import.meta.glob<{ default: Page }>('./pages/**/*.tsx'),
        );
        return module.default;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
