/* Tava Labs reusable product page component behavior.
   Shared by every product page: gallery thumbnail swap and accordions.
   No checkout or modal logic lives here. Every call to action on a
   product page is a plain link to the quiz. */
(function () {
  function swapGallery(thumb) {
    var main = document.querySelector("[data-pp-gallery-main]");
    if (!main || !thumb) return;
    var full = thumb.getAttribute("data-full");
    if (!full) return;
    main.style.opacity = "0";
    setTimeout(function () {
      main.src = full;
      var alt = thumb.getAttribute("data-alt");
      if (alt) main.alt = alt;
      main.style.opacity = "1";
    }, 150);
    var thumbs = document.querySelectorAll("[data-pp-thumb]");
    thumbs.forEach(function (t) { t.classList.remove("pp-thumb-active"); });
    thumb.classList.add("pp-thumb-active");
  }

  document.addEventListener("click", function (e) {
    var thumb = e.target && e.target.closest ? e.target.closest("[data-pp-thumb]") : null;
    if (thumb) { swapGallery(thumb); return; }
    var btn = e.target && e.target.closest ? e.target.closest("[data-pp-acc-btn]") : null;
    if (btn) {
      var acc = btn.closest(".pp-acc");
      if (acc) acc.classList.toggle("pp-open");
    }
  });
})();
