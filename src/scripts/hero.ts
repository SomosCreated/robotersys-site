// Hero spotlight + parallax — ported from docs/reference/design-system/assets/js/interactions.js
// Guards: (1) hover:hover media query, (2) prefers-reduced-motion

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hoverCapable  = window.matchMedia('(hover: hover)').matches;

// Only set up interactions when the device supports hover AND the user hasn't
// requested reduced motion (parallax/transform effects would otherwise distract).
if (hoverCapable && !reducedMotion) {
  const hero         = document.getElementById('hero') as HTMLElement | null;
  const spotlight    = document.getElementById('hero-spotlight') as HTMLElement | null;
  const spotlightCore = document.getElementById('hero-spotlight-core') as HTMLElement | null;
  const poster       = document.getElementById('hero-poster') as HTMLElement | null;
  const cards        = document.querySelectorAll<HTMLElement>('.telemetry-card');

  if (hero && spotlight && spotlightCore) {
    hero.addEventListener('mousemove', (e: MouseEvent) => {
      const rect    = hero.getBoundingClientRect();
      const mouseX  = e.clientX - rect.left;
      const mouseY  = e.clientY - rect.top;

      // --- Spotlight radial gradient follows the cursor ---
      spotlight.style.opacity = '1';
      spotlight.style.background =
        `radial-gradient(1000px at ${mouseX}px ${mouseY}px, rgba(234, 88, 12, 0.25), transparent 60%)`;

      spotlightCore.style.opacity = '1';
      spotlightCore.style.background =
        `radial-gradient(400px at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.08), transparent 60%)`;

      // --- Parallax ---
      const centerX  = rect.width  / 2;
      const centerY  = rect.height / 2;
      const percentX = (mouseX - centerX) / centerX; // −1 … +1
      const percentY = (mouseY - centerY) / centerY;

      // Poster drifts gently (replaces the video transform in the reference)
      if (poster) {
        poster.style.transform =
          `scale(1.05) translate(${percentX * -15}px, ${percentY * -15}px)`;
      }

      // Stat cards — each has data-depth (0.1 – 0.2) controlling the magnitude
      cards.forEach((card) => {
        const depth = parseFloat(card.dataset['depth'] ?? '0.1');
        const moveX = percentX * 60 * depth;
        const moveY = percentY * 60 * depth;
        card.style.transform =
          `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${percentY * -8}deg) rotateY(${percentX * 8}deg)`;
      });
    });

    hero.addEventListener('mouseleave', () => {
      spotlight.style.opacity     = '0';
      spotlightCore.style.opacity = '0';

      if (poster) poster.style.transform = 'scale(1.05) translate(0, 0)';

      cards.forEach((card) => {
        card.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }
}
