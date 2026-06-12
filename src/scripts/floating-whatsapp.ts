/**
 * floating-whatsapp.ts
 *
 * Cycles the FloatingWhatsApp button between two visual states every ~3 s.
 *
 * State A (alert):  #fwa-state-alert  — siren icon + "LINHA PARADA"
 * State B (invite): #fwa-state-invite — WhatsApp icon + "ENTRE EM CONTATO"
 *
 * prefers-reduced-motion: reduced
 *   → Show only State B (invite), static. No cycling, no pulse animation.
 */

(function initFloatingWhatsApp() {
  const alert  = document.getElementById('fwa-state-alert');
  const invite = document.getElementById('fwa-state-invite');

  if (!alert || !invite) return;

  // Honour reduced-motion preference — show static invite and exit.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) {
    invite.classList.add('fwa-active');
    alert.classList.remove('fwa-active');
    return;
  }

  // Start with State B (invite) active.
  invite.classList.add('fwa-active');
  alert.classList.remove('fwa-active');
  let showingAlert = false;

  const CYCLE_MS = 3000;

  const cycle = () => {
    showingAlert = !showingAlert;
    if (showingAlert) {
      invite.classList.remove('fwa-active');
      alert.classList.add('fwa-active');
    } else {
      alert.classList.remove('fwa-active');
      invite.classList.add('fwa-active');
    }
  };

  let intervalId = window.setInterval(cycle, CYCLE_MS);

  // If the user later enables reduced-motion (system setting change), stop cycling.
  reducedMotion.addEventListener('change', (e) => {
    if (e.matches) {
      clearInterval(intervalId);
      invite.classList.add('fwa-active');
      alert.classList.remove('fwa-active');
    } else {
      // Reduced motion was turned off — restart cycling.
      intervalId = window.setInterval(cycle, CYCLE_MS);
    }
  });
})();
