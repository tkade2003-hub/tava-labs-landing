/* ============================================================
   Tava Labs — shared site header (single source of truth)
   Every page has a <div data-component="header"></div> placeholder
   followed by this script; the placeholder is replaced in place
   by the header markup below. Edit the markup HERE and it
   changes on every page at once.
   Header is light on all pages -> black wordmark (IMG_3241).
   The Shop link carries data-buy="one_time": on the landing page
   the checkout script intercepts it and opens direct checkout;
   on other pages it simply follows the link to the landing page.
   ============================================================ */
(function () {
  var mount = document.querySelector('[data-component="header"]');
  if (!mount) return;
  mount.outerHTML = [
    '<nav>',
    '  <div class="wordmark"><a href="index.html"><img class="logo-img" src="assets/IMG_3241.png" alt="Tava Labs"></a></div>',
    '  <a class="shop" href="https://tavalabs.app" data-buy="one_time">Shop</a>',
    '</nav>'
  ].join('\n');
})();
