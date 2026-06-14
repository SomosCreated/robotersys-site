/**
 * countup.ts — animate [data-countup] numbers from 0 → their value when scrolled
 * into view (the "// Nosso trabalho em números" stats band).
 *
 * Robustness (important — these are real metrics, never show a wrong number):
 *  - The element KEEPS its real, final value until it actually animates. We never
 *    reset to "0" on load, so off-screen / no-JS / reduced-motion users always see
 *    the correct number.
 *  - Animation only runs when the band scrolls into view (IntersectionObserver).
 *  - If the tab is hidden (requestAnimationFrame is paused) or reduced-motion is on,
 *    we skip the animation and just show the final value.
 *  - A safety timeout forces the final value after the animation window, so a
 *    throttled/stalled rAF can never leave a number stuck mid-count.
 *  - Values that aren't a single countable integer (e.g. "24/7") are left untouched.
 *  - Thousands separator ("." pt-BR / "," en) and prefix/suffix ("+") are detected
 *    from the original text and preserved.
 */

/** Insert a thousands separator every 3 digits (e.g. 1200 + "." → "1.200"). */
function groupThousands(n: number, sep: string): string {
  const s = String(n);
  return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : s;
}

interface Parsed {
  el: HTMLElement;
  prefix: string;
  suffix: string;
  sep: string;
  target: number;
  final: string; // the original, correct text — restored at the end
}

function initCountUp(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-countup]'));
  if (!els.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const parsed: Parsed[] = [];

  for (const el of els) {
    const raw = (el.textContent || '').trim();
    if (raw.includes('/')) continue; // skip "24/7" and similar
    const m = raw.match(/^(\D*?)(\d[\d.,]*)(\D*)$/);
    if (!m) continue;
    const numStr = m[2];
    const target = parseInt(numStr.replace(/[.,]/g, ''), 10);
    if (!Number.isFinite(target)) continue;
    const sepMatch = numStr.match(/[.,]/);
    parsed.push({ el, prefix: m[1], suffix: m[3], sep: sepMatch ? sepMatch[0] : '', target, final: raw });
  }

  // Nothing to animate or reduced-motion → leave the real values untouched.
  if (!parsed.length || reduced) return;

  const DURATION = 1600;
  const easeOutExpo = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const setFinal = (p: Parsed): void => {
    p.el.textContent = p.final;
  };

  const animate = (p: Parsed): void => {
    // Hidden tab → rAF is paused; don't risk a stuck count, just show the value.
    if (document.hidden) {
      setFinal(p);
      return;
    }
    // Safety net: guarantee the final value even if rAF stalls partway.
    const safety = window.setTimeout(() => setFinal(p), DURATION + 400);
    const start = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - start) / DURATION);
      p.el.textContent = `${p.prefix}${groupThousands(Math.round(easeOutExpo(t) * p.target), p.sep)}${p.suffix}`;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        clearTimeout(safety);
        setFinal(p);
      }
    };
    p.el.textContent = `${p.prefix}0${p.suffix}`; // start from zero
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const p = parsed.find((x) => x.el === entry.target);
        if (p) animate(p);
        obs.unobserve(entry.target);
      }
    },
    { threshold: 0.4 },
  );

  for (const p of parsed) io.observe(p.el);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCountUp);
} else {
  initCountUp();
}
