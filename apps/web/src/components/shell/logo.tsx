/**
 * LW brand mark (placeholder monogram). The real logo SVG drops in at
 * /public/brand/lw-logo.svg (DESIGN_SYSTEM.md §1) and replaces this component.
 * Emerald-on-dark, sharp geometry — the only brand mark.
 */
export function LwLogo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="Lewis Wealth Intelligence">
      <rect x="1" y="1" width="38" height="38" rx="8" fill="#0e1315" stroke="#1e262a" />
      <rect x="1" y="1" width="38" height="38" rx="8" fill="url(#lw-g)" fillOpacity="0.14" />
      <path d="M11 11v18h8.5" stroke="#10b981" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.5 13l3.2 14 3.3-9.5 3.3 9.5 3.2-14" stroke="#5ee9b5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <defs>
        <linearGradient id="lw-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LwWordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <LwLogo size={30} />
      <div className="leading-tight">
        <div className="text-[13px] font-semibold tracking-tight text-fg">
          Lewis Wealth
        </div>
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-emerald/80">
          Intelligence
        </div>
      </div>
    </div>
  );
}
