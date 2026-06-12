const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const els = document.querySelectorAll<HTMLElement>('.sys-reveal');
if (reduce) {
  els.forEach((el) => el.classList.add('sys-active'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('sys-active');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  els.forEach((el) => io.observe(el));
}
