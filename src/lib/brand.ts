/**
 * brand.ts — keep the "RoboterSys." wordmark in its correct brand casing
 * everywhere, even inside otherwise-uppercase headings.
 *
 * The site's headings use `text-transform: uppercase`, which would render the
 * brand as "ROBOTERSYS." — against the brand standard. `brandHtml()` wraps every
 * "RoboterSys" / "RoboterSys." occurrence in a <span class="normal-case"> so the
 * wordmark keeps its mixed-case form while the rest of the heading stays upper.
 *
 * Usage (Astro):  <h2 ... set:html={brandHtml(t(locale, 'some.heading'))} />
 *
 * The input is our own i18n text (trusted). We still HTML-escape the surrounding
 * text first, then inject only the brand span — safe to use with set:html.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function brandHtml(text: string): string {
  return escapeHtml(text).replace(
    /RoboterSys\.?/g,
    (m) => `<span class="normal-case">${m}</span>`,
  );
}
