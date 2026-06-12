import plugin from 'tailwindcss/plugin';

export default plugin(({ addUtilities }) => {
  const rotateValues = [0, 5, 10, 15, 20, 30, 45, 75];
  const tf = (varName, val) => ({
    [varName]: val,
    transform:
      'translate3d(var(--tw-translate-x,0),var(--tw-translate-y,0),var(--tw-translate-z,0)) ' +
      'rotateX(var(--tw-rotate-x,0)) rotateY(var(--tw-rotate-y,0)) rotateZ(var(--tw-rotate-z,0)) ' +
      'skewX(var(--tw-skew-x,0)) skewY(var(--tw-skew-y,0)) ' +
      'scaleX(var(--tw-scale-x,1)) scaleY(var(--tw-scale-y,1))',
  });
  const utils = {};
  for (const axis of ['x', 'y', 'z']) {
    for (const v of rotateValues) {
      utils[`.rotate-${axis}-${v}`] = tf(`--tw-rotate-${axis}`, `${v}deg`);
      if (v !== 0) utils[`.-rotate-${axis}-${v}`] = tf(`--tw-rotate-${axis}`, `-${v}deg`);
    }
  }
  addUtilities({
    ...utils,
    '.perspective-none': { perspective: 'none' },
    '.perspective-dramatic': { perspective: '100px' },
    '.perspective-near': { perspective: '300px' },
    '.perspective-normal': { perspective: '500px' },
    '.perspective-midrange': { perspective: '800px' },
    '.perspective-distant': { perspective: '1200px' },
    '.perspective-1000': { perspective: '1000px' },
    '.transform-style-preserve-3d': { 'transform-style': 'preserve-3d' },
    '.transform-style-flat': { 'transform-style': 'flat' },
  });
});
