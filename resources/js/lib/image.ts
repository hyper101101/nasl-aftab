const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 8 * 1024 * 1024;

// عکس رو کوچیک می‌کنه (حداکثر ۸۰۰ پیکسل) و به JPEG تبدیل می‌کنه
// بک‌اند هم باید نوع و حجم فایل رو خودش دوباره بررسی کنه
export async function fileToDataUrl(file: File, maxSize = 800): Promise<string> {
    if (!ALLOWED.includes(file.type)) {
        throw new Error('فقط تصویر JPG، PNG یا WebP مجاز است.');
    }
    if (file.size > MAX_BYTES) {
        throw new Error('حجم تصویر باید کمتر از ۸ مگابایت باشد.');
    }

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('پردازش تصویر انجام نشد.');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    return canvas.toDataURL('image/jpeg', 0.82);
}
