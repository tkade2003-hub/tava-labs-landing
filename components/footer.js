/* ============================================================
   Tava Labs — shared site footer (single source of truth)
   Every page has a placeholder:
     <div data-component="footer" data-theme="light"></div>
   followed by this script; the placeholder is replaced in place
   by the footer markup below. Edit the markup HERE and it
   changes on every page at once.

   Theme (data-theme on the placeholder):
   - "dark"  — landing page (index.html): dark forest footer,
               white wordmark (IMG_3240), a top row (Take the
               Quiz / Shop the Serum) and two link columns —
               Contact (email, Instagram) and Info (the five
               legal pages) — plus the fine print. This is the
               ONLY footer on the landing page.
   - "light" — legal pages: light footer, black wordmark
               (IMG_3241), no fine print.
   ============================================================ */
(function () {
  var mount = document.querySelector('[data-component="footer"]');
  if (!mount) return;
  var dark = mount.getAttribute('data-theme') === 'dark';
  var logo = dark ? 'assets/IMG_3240.png' : 'assets/IMG_3241.png';
  var parts = [
    '<footer>',
    '  <div class="wordmark"><img class="logo-img" src="' + logo + '" alt="Tava Labs"></div>',
    '  <p>The Science of Attractive Health</p>'
  ];
  if (dark) {
    parts.push(
      '  <div class="f-top">',
      '    <a class="f-btn" href="quiz.html">Take the Quiz</a>',
      '    <a class="f-btn" href="quiz.html" data-buy="one_time">Shop the Serum</a>',
      '  </div>',
      '  <div class="f-cols">',
      '    <div class="f-col">',
      '      <h4>Contact</h4>',
      '      <a href="mailto:talia@tavalabs.app">talia@tavalabs.app</a>',
      '      <a href="https://www.instagram.com/tava_labs" target="_blank" rel="noopener">Instagram @tava_labs</a>',
      '    </div>',
      '    <div class="f-col">',
      '      <h4>Info</h4>',
      '      <a href="privacy.html">Privacy Policy</a>',
      '      <a href="terms.html">Terms &amp; Conditions</a>',
      '      <a href="returns.html">Return &amp; Refund Policy</a>',
      '      <a href="cookies.html">Cookie Policy</a>',
      '      <a href="shipping.html">Shipping Policy</a>',
      '    </div>',
      '  </div>'
    );
  } else {
    parts.push('  <p style="margin-top:8px;">Questions? <a href="mailto:talia@tavalabs.app">talia@tavalabs.app</a> &middot; <a href="https://tavalabs.app">tavalabs.app</a></p>');
  }
  if (!dark) {
    /* Dark footer: the legal pages live in the Info column above,
       so this nav only renders on the light (legal-page) footer. */
    parts.push(
      '  <nav class="legal-links" aria-label="Legal">',
      '    <a href="privacy.html">Privacy Policy</a>',
      '    <a href="terms.html">Terms &amp; Conditions</a>',
      '    <a href="returns.html">Return &amp; Refund Policy</a>',
      '    <a href="cookies.html">Cookie Policy</a>',
      '    <a href="shipping.html">Shipping Policy</a>',
      '  </nav>'
    );
  }
  if (dark) {
    parts.push('  <p class="fineprint">Glow Brightening Serum is a cosmetic product. It is not intended to diagnose, treat, cure, or prevent any disease. Individual results may vary.</p>');
  }
  parts.push('  <p style="margin-top:14px;">&copy; 2026 Tava Labs</p>');
  parts.push('</footer>');
  mount.outerHTML = parts.join('\n');
})();
