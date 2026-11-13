type Props = {
    value: number;
    max: number;
    onChange: (value: number) => void;
};

const wrap = 'inline-flex items-center rounded-xl border border-pine/25 bg-cream';

const stepBtn = [
    'flex size-12 items-center justify-center text-xl font-bold transition-colors',
    'hover:bg-pine/10 disabled:cursor-not-allowed disabled:opacity-35',
].join(' ');

export default function QuantityStepper({ value, max, onChange }: Props) {
    return (
        <div role="group" aria-label="تعداد" className={wrap}>
            <button
                type="button"
                aria-label="کم کردن تعداد"
                disabled={value <= 1}
                onClick={() => onChange(value - 1)}
                className={stepBtn}
            >
                −
            </button>
            <output aria-live="polite" className="min-w-10 text-center text-lg font-bold">
                {value.toLocaleString('fa-IR')}
            </output>
            <button
                type="button"
                aria-label="زیاد کردن تعداد"
                disabled={value >= max}
                onClick={() => onChange(value + 1)}
                className={stepBtn}
            >
                +
            </button>
        </div>
    );
}
