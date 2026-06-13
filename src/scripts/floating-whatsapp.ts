/**
 * floating-whatsapp.ts
 *
 * Cycles the FloatingWhatsApp circle button through 4 visual states every ~2.5 s:
 *
 *   State 1: #fwa-state-1 — WhatsApp icon, green background
 *   State 2: #fwa-state-2 — Siren icon,    orange background
 *   State 3: #fwa-state-3 — idle text,     orange background
 *   State 4: #fwa-state-4 — invite text,   orange background
 *
 * prefers-reduced-motion: reduced
 *   → Show only State 1 (WhatsApp icon, green), static. No cycling, no pulse.
 */

(function initFloatingWhatsApp() {
  const states = [1, 2, 3, 4].map((n) => document.getElementById(`fwa-state-${n}`));

  // Bail out if any expected state element is missing.
  if (states.some((el) => !el)) return;

  const setActive = (index: number) => {
    states.forEach((el, i) => {
      if (i === index) {
        el!.classList.add('fwa-active');
      } else {
        el!.classList.remove('fwa-active');
      }
    });
  };

  // Honour reduced-motion preference — show static State 1 (green WhatsApp) and exit.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) {
    setActive(0); // State 1 (index 0)
    return;
  }

  // Start with State 1 active.
  let currentIndex = 0;
  setActive(currentIndex);

  const CYCLE_MS = 2500;

  const cycle = () => {
    currentIndex = (currentIndex + 1) % 4;
    setActive(currentIndex);
  };

  let intervalId = window.setInterval(cycle, CYCLE_MS);

  // If the user later enables reduced-motion (system setting change), stop cycling.
  reducedMotion.addEventListener('change', (e) => {
    if (e.matches) {
      clearInterval(intervalId);
      setActive(0); // Fall back to State 1 (green WhatsApp)
    } else {
      // Reduced motion was turned off — restart cycling from current state.
      intervalId = window.setInterval(cycle, CYCLE_MS);
    }
  });
})();
