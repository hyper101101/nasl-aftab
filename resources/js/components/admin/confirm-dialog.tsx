import { useEffect, useRef } from 'react';

type Props = {
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
};

const dialogClass = [
    'on-cream m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-cream p-0 text-pine shadow-2xl',
    'backdrop:bg-pine/70 backdrop:backdrop-blur-sm',
].join(' ');

const dangerBtn = [
    'rounded-xl bg-bordo px-5 py-2.5 font-bold text-cream',
    'transition-colors hover:bg-bordo/85',
].join(' ');

export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: Props) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            onClose={onCancel}
            onClick={(e) => {
                if (e.target === ref.current) onCancel();
            }}
            aria-labelledby="confirm-title"
            className={dialogClass}
        >
            <div className="p-6 sm:p-8">
                <h2 id="confirm-title" className="text-xl font-extrabold">
                    {title}
                </h2>
                <p className="mt-3 leading-8 text-pine/85">{message}</p>

                <div className="mt-7 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl border border-pine/30 px-5 py-2.5 font-medium hover:bg-pine/10"
                    >
                        انصراف
                    </button>
                    <button type="button" onClick={onConfirm} className={dangerBtn}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}
