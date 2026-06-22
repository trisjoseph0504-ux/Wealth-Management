# Design System — Lewis Wealth Intelligence

**Aesthetic target:** dark luxury, institutional, high-trust. The reference
points are Bloomberg Terminal (density, seriousness), Aladdin (analytical
authority), and modern high-end fintech (restraint, polish). The feeling we want
when an advisor opens LWI: _"this is precise, expensive, and built by people who
take money seriously."_

> **Anti-goals:** generic SaaS gradients, rounded cartoonish cards, playful
> illustrations, drop-shadow soup, emoji, **any gold or yellow**, neon, glassy
> blur for decoration. If it looks like a Series-A landing page, it's wrong.

---

## 1. Brand

- **Primary mark:** the **LW** logo. It is the only brand mark. Place the SVG at
  `apps/web/public/brand/lw-logo.svg` (and `lw-logo-mono.svg`,
  `lw-wordmark.svg`). Minimum clear space = the height of the "L". Never recolor
  the mark outside the approved emerald/neutral set; never place on a busy field.
- **Accent identity:** emerald green, derived from the LW logo. Emerald signals
  growth and money without resorting to the financial cliché of gold.
- **Voice:** precise, calm, declarative. Numbers speak; copy gets out of the way.

## 2. Color system

All color is delivered as **design tokens** (CSS variables + a TS export in
`@lwi/ui/tokens`). Components reference token names, never raw values. Tokens are
defined in OKLCH internally for perceptual consistency; hex shown for reference.

### Core neutrals (dark luxury canvas)

Not pure black — a near-black with a faint cool-green cast reads richer and
reduces eye strain in dense data views.

| Token              | Hex (ref) | Use                                   |
| ------------------ | --------- | ------------------------------------- |
| `--bg-base`        | `#07090A` | App background (deepest)              |
| `--bg-canvas`      | `#0B0F11` | Primary working surface               |
| `--bg-surface`     | `#121719` | Cards, panels                         |
| `--bg-surface-2`   | `#181F22` | Raised / hovered surface              |
| `--bg-inset`       | `#0E1315` | Wells, table headers, inputs          |
| `--border-subtle`  | `#1E262A` | Hairline dividers                     |
| `--border-strong`  | `#2A353A` | Emphasized borders, focus rings base  |
| `--text-primary`   | `#E8EDEC` | Primary text                          |
| `--text-secondary` | `#9BA8A6` | Secondary / labels                    |
| `--text-tertiary`  | `#6B7976` | Muted / disabled                      |

### Emerald (primary accent — from LW)

| Token              | Hex (ref) | Use                                   |
| ------------------ | --------- | ------------------------------------- |
| `--emerald-50`     | `#E6F7EF` | On-dark text on emerald fills         |
| `--emerald-300`    | `#5EE9B5` | Highlights, sparkline up              |
| `--emerald-500`    | `#10B981` | Primary accent, key actions           |
| `--emerald-600`    | `#059669` | Pressed / strong accent               |
| `--emerald-700`    | `#047857` | Accent on light contexts (rare)       |
| `--emerald-glow`   | `rgba(16,185,129,0.14)` | Focus aura, active nav    |

### Semantic — financial

> **Design challenge resolved:** conventional finance UIs use **amber/yellow for
> caution**. That palette is **banned** by brand. We replace caution-yellow with
> a **cool slate-cyan** plus iconography, so caution never relies on a forbidden
> hue. Positive/negative remain green/red because those carry hard meaning in
> finance and removing red would harm comprehension.

| Token              | Hex (ref) | Meaning                               |
| ------------------ | --------- | ------------------------------------- |
| `--pos`            | `#10B981` | Gains, up moves (emerald — on-brand)  |
| `--pos-soft`       | `rgba(16,185,129,0.12)` | Positive cell/row tint   |
| `--neg`            | `#F2555A` | Losses, down moves (refined red, not pure #F00) |
| `--neg-soft`       | `rgba(242,85,90,0.12)`  | Negative cell/row tint   |
| `--caution`        | `#5BA6B5` | Warnings, attention (cool — NOT amber)|
| `--info`           | `#6E8BA8` | Neutral information                   |
| `--neutral-flat`   | `#9BA8A6` | Unchanged / zero move                 |

**Rule:** never use emerald for a non-positive meaning, and never use red for
anything but loss/destructive — color carries data here.

## 3. Typography

> **Avoid generic SaaS = avoid Inter-as-default.** We pair a refined grotesk for
> UI with a true monospace for figures, and an editorial serif reserved for AI
> commentary so it reads like a research note, not a chatbot.

| Role            | Typeface (primary)        | Fallback / notes                    |
| --------------- | ------------------------- | ----------------------------------- |
| Display / UI    | **Satoshi** (or Geist Sans) | Modern grotesk, tight, premium     |
| Numeric / data  | **Geist Mono** (or JetBrains Mono) | **Tabular figures mandatory** |
| Editorial       | **Newsreader** (serif)    | AI commentary, long-form research   |

Rules:

- **All financial numbers use tabular/monospaced figures** so columns align to
  the decimal. This is enforced via the `<Money>`/`<Percent>` primitives.
- Type scale (rem): `12 / 13 / 14 / 16 / 20 / 24 / 32 / 44`. 14px is the data
  baseline; 16px body. Line-height tight for data (1.3), comfortable for prose.
- Weights: 400 body, 500 labels, 600 headings. Avoid 700+ except wordmark.
- Letter-spacing slightly negative on display sizes; never on mono.
- Self-host fonts (`apps/web/public/fonts`) — no FOUT, no third-party CDN
  (privacy + performance + reliability).

## 4. Spacing, grid & layout

- **4px base unit.** Spacing scale: `4 8 12 16 20 24 32 40 48 64`. No arbitrary
  values. Density is a virtue here — institutional users want information, not
  whitespace cushions, but alignment must be exact.
- **12-column responsive grid**, 1440px reference width, 24px gutters. Dense data
  app, designed desktop-first; usable down to tablet. Phone is read-mostly.
- **Sharp corners.** Radius scale is restrained: `0` (tables, panels), `4px`
  (controls), `8px` (cards/modals max). No pill buttons, no big rounded blobs.
- Borders over shadows for separation; shadows are subtle and cool-toned, used
  only for true elevation (modals, popovers), never decoration.
- Consistent app shell: left rail (nav), top bar (context + global search +
  account), main content region with a max content width for readability.

## 5. Component standards

Shared, generic components live in **`@lwi/ui`**; feature-specific composition
lives in `apps/web/src/features`. Every `@lwi/ui` component must:

1. Consume tokens only (no hardcoded color/space/type).
2. Be fully typed, with documented props and sensible defaults.
3. Have keyboard + screen-reader support and visible focus states.
4. Ship loading (skeleton), empty, and error states — not just the happy path.
5. Be presentational (no data fetching inside).

### Foundational primitives (build order)

`Button` · `IconButton` · `Input` / `Select` / `Combobox` · `Toggle` ·
`Tooltip` · `Tabs` · `Dialog` / `Drawer` · `Popover` · `Menu` · `Toast` ·
`Card` / `Panel` · `Table` (AG Grid wrapper) · `Badge` / `Tag` · `Skeleton` ·
`Stat` · `Money` · `Percent` · `Delta` (signed, colored) · `Sparkline` ·
`Chart` wrappers · `EmptyState`.

Built on **Radix UI** primitives for behavior/a11y, styled with our tokens — we
own the look, Radix owns the accessibility plumbing.

### Financial display primitives (special care)

- `<Money value currency />` — tabular, right-aligned, locale-aware grouping,
  explicit currency, configurable precision.
- `<Percent value />` and `<Delta value />` — signed, colored via `--pos`/`--neg`,
  with an up/down glyph; zero uses `--neutral-flat`.
- These are the **only** sanctioned way to render financial values. Ad-hoc
  `toFixed()` in a component is a review-blocking issue.

## 6. Data visualization standards

- Charts inherit the token palette; **no chart library default colors.**
- Up = emerald, down = `--neg`, neutral series = neutral scale. Categorical
  series use a pre-defined, color-blind-safe emerald→teal→slate ramp (never
  introducing yellow).
- Always label axes/units; show last value; support crosshair/tooltip with exact
  figures. Never imply false precision; never start bar-chart axes at non-zero.
- Performance: virtualize large series; price charts via TradingView Lightweight
  Charts; analytical charts via Visx for full design control.

## 7. Motion

- Purpose only: feedback, continuity, focus. Durations 120–240ms, ease-out.
- No spring/bounce, no decorative looping animation. Respect
  `prefers-reduced-motion`. Skeleton shimmer is subtle and cool-toned.

## 8. Theming & tokens implementation

- Tokens are CSS variables. Components reference **semantic** names via Tailwind
  utilities (`bg-surface`, `text-fg`, `text-pos`), never raw hex/scale values.
- Dark is the default and primary brand theme.

## 9. Do / Don't quick reference

| Do                                            | Don't                                  |
| --------------------------------------------- | -------------------------------------- |
| Use tokens for every color/space/type         | Hardcode hex/px in components          |
| Emerald for positive/brand only               | Use emerald as a generic UI fill       |
| Cool slate-cyan for caution; `warn` amber only for risk severity | Use amber/yellow as a decorative accent (banned) |
| Tabular figures for all numbers               | `toFixed()` ad hoc in a component      |
| Sharp corners, hairline borders               | Big radii, heavy drop shadows          |
| Restrained, fast motion                       | Bouncy/playful/looping animation       |
| Self-hosted premium type                      | Default Inter / system-ui everywhere   |

## 10. Light & dark theming architecture (built in Phase 1)

The platform ships **dark-first** but is structured so a premium **light** theme
can be added later **without touching a single component**. How it works
(`apps/web/src/app/globals.css`):

1. **Semantic variables are defined per theme scope.** Dark lives in
   `:root, [data-theme="dark"]`; a light scaffold lives in `[data-theme="light"]`
   (functional structure, not yet design-polished — refine in a later phase).
   Each scope sets the same variable names (`--bg-surface`, `--fg`, `--pos`,
   `--accent-contrast`, `--pos-soft`, …) to theme-appropriate values.
2. **Tailwind utilities map to those variables.** The `@theme` block sets
   `--color-surface: var(--bg-surface)`, etc., so `bg-surface` / `text-fg` resolve
   through the **active** theme at the use site (CSS custom-property substitution
   follows the cascade, so a card inside `[data-theme="light"]` paints light).
3. **Switching themes is one attribute.** `<html data-theme="…">`. A future
   toggle flips it (plus a tiny no-flash inline script that reads the saved
   preference before paint). No CSS or component changes required.

**Rules that keep this working:**

- Never hardcode a hex/rgba in a component. Use a utility (`bg-surface`) or, for
  soft tints, a semantic var (`bg-[var(--pos-soft)]`). Both are theme-aware.
- New colors are added as **semantic vars in every theme scope**, then mapped in
  `@theme` — not as one-off literals.
- Both themes obey the brand: **no gold/yellow**; caution stays cool slate-cyan;
  emerald = positive/brand only.
- The data-viz categorical ramp and the LW logo are currently dark-tuned; light
  variants are a known, documented follow-up (not a blocker).

| Do                                            | Don't                                  |
| --------------------------------------------- | -------------------------------------- |
| Use tokens for every color/space/type         | Hardcode hex/px in components          |
| Emerald for positive/brand only               | Use emerald as a generic UI fill       |
| Cool slate-cyan for caution; `warn` amber only for risk severity | Use amber/yellow as a decorative accent (banned) |
| Tabular figures for all numbers               | `toFixed()` ad hoc in a component      |
| Sharp corners, hairline borders               | Big radii, heavy drop shadows          |
| Restrained, fast motion                       | Bouncy/playful/looping animation       |
| Self-hosted premium type                      | Default Inter / system-ui everywhere   |
