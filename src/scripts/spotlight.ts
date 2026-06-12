/**
 * spotlight.ts — Flashlight border effect for .spotlight-grid containers.
 *
 * Ported from docs/reference/design-system/assets/js/interactions.js section 4.
 * For each .spotlight-grid, listens to mousemove and sets --mouse-x / --mouse-y
 * on every child .spotlight-card so the CSS radial-gradient border glow tracks
 * the cursor position relative to each card.
 *
 * Guards:
 *   - window.matchMedia('(hover: hover)') — no effect on touch-only devices.
 *   - prefers-reduced-motion is respected at the CSS level (opacity transition).
 */

if (window.matchMedia('(hover: hover)').matches) {
  const grids = document.querySelectorAll<HTMLElement>('.spotlight-grid');

  grids.forEach((grid) => {
    grid.addEventListener('mousemove', (e: MouseEvent) => {
      const cards = grid.querySelectorAll<HTMLElement>('.spotlight-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  });
}
