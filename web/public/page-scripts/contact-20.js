
/* Footer newsletter forms: POST to the newsletter-signup Supabase edge
   function, same endpoint and payload as the main page signup. Success and
   failure states reuse the form block's own done/fail panels. */
(function () {
  var forms = document.querySelectorAll('.footer__form');
  if (!forms.length) return;
  Array.prototype.forEach.call(forms, function (form) {
    var block = form.parentElement;
    var done = block.querySelector('.w-form-done');
    var fail = block.querySelector('.w-form-fail');
    var emailEl = form.querySelector('input[type="email"]');
    var btn = form.querySelector('input[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (emailEl.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        if (fail) fail.style.display = 'block';
        return;
      }
      if (fail) fail.style.display = 'none';
      btn.disabled = true;
      btn.value = 'Joining…';
      fetch('https://vuzrpgkqytzvbbxwsvqr.supabase.co/functions/v1/newsletter-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      }).then(function (res) {
        if (!res.ok) throw new Error('signup failed');
        return res.json();
      }).then(function () {
        form.style.display = 'none';
        if (done) done.style.display = 'block';
      }).catch(function () {
        if (fail) fail.style.display = 'block';
        btn.disabled = false;
        btn.value = 'SUBSCRIBE';
      });
    });
  });
})();
