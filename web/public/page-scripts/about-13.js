
/* Film preview poster: the poster attribute on the video element
   (assets/products/pdrn-bright-serum/view-1-mockup.jpg, a product shot
   chosen by Vashon) is what shows before playback.
   The first time the visitor presses play, playback restarts from
   the beginning, with sound. */
(function () {
  var v = document.getElementById('kjFilm');
  if (!v) return;
  var armed = false;
  function armRestart() {
    if (armed) return;
    armed = true;
    v.addEventListener('play', function () {
      if (v.currentTime > 0.5) { try { v.currentTime = 0; } catch (e) {} }
    }, { once: true });
  }
  armRestart();
})();
