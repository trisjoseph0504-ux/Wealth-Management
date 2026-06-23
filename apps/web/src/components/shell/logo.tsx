/**
 * Lewis Wealth brand mark — gold ring enclosing a serif LW monogram above a green
 * leaf-wave, vectorized from the brand artwork. Gold/green render the same in light
 * and dark; the wordmark text uses `--color-fg` so it stays legible on either.
 */
const GOLD = "#C9A24B";

export function LwLogo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" role="img" aria-label="Lewis Wealth">
      <defs>
        <linearGradient id="lwGold" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#E9CE84" />
          <stop offset="0.5" stopColor="#C9A24B" />
          <stop offset="1" stopColor="#9C7128" />
        </linearGradient>
        <linearGradient id="lwGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2F8C50" />
          <stop offset="1" stopColor="#0E5A2C" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#lwGold)" strokeWidth="3.4" />
      <path d="M17 66 C 37 51 63 48 83 63 C 63 83 33 87 17 66 Z" fill="url(#lwGreen)" />
      <path d="M17 61 C 37 48 63 46 83 58" fill="none" stroke="url(#lwGold)" strokeWidth="2.4" strokeLinecap="round" />
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="44"
        letterSpacing="-2"
        fill="url(#lwGold)"
      >
        LW
      </text>
    </svg>
  );
}

export function LwWordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <LwLogo size={34} />
      <div className="leading-none">
        <div className="text-[14px] font-semibold tracking-[0.16em] text-fg" style={{ fontFamily: "var(--font-serif)" }}>
          LEWIS
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="h-px flex-1" style={{ background: GOLD }} />
          <span
            className="text-[8.5px] font-medium uppercase tracking-[0.3em]"
            style={{ color: GOLD, fontFamily: "var(--font-serif)" }}
          >
            Wealth
          </span>
          <span className="h-px flex-1" style={{ background: GOLD }} />
        </div>
      </div>
    </div>
  );
}
