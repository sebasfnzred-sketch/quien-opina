// Medidor de arco (semicírculo) para los scores ejecutivos: riesgo, oportunidad.
// SVG puro — sin dependencias. El arco se rellena según el valor 0–100.

export function ScoreGauge({
  value,
  label,
  color,
  caption,
}: {
  value: number;
  label: string;
  color: string;
  caption: string;
}) {
  const size = 168;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  // Semicírculo superior: de 180° a 360°.
  const circumference = Math.PI * r; // media circunferencia
  const filled = (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 18 }}>
        <svg width={size} height={size / 2 + 18} viewBox={`0 0 ${size} ${size / 2 + 18}`}>
          <defs>
            <linearGradient id={`g-${label}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={`color-mix(in srgb, ${color} 50%, transparent)`} />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          {/* Track */}
          <path
            d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`}
            fill="none"
            stroke="var(--color-ink-700)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Relleno */}
          <path
            d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`}
            fill="none"
            stroke={`url(#g-${label})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            style={{
              filter: `drop-shadow(0 0 6px color-mix(in srgb, ${color} 70%, transparent))`,
              transition: "stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="font-display text-4xl font-semibold tabular-nums" style={{ color }}>
            {value}
          </span>
          <span className="label-mono -mt-1">/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-semibold text-bone">{label}</div>
        <div className="mt-0.5 text-xs text-muted">{caption}</div>
      </div>
    </div>
  );
}
