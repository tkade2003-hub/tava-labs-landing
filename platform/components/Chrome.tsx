export function PlatformHeader({ email, onSignOut }: { email?: string; onSignOut?: () => void }) {
  return (
    <header className="p-header">
      <a className="brand" href="index.html">
        TAVA<small>LABS</small>
      </a>
      <nav>
        <a href="index.html">Home</a>
        <a href="quiz.html">Skin Quiz</a>
        {email ? (
          <span className="p-muted" style={{ color: "#FAF5EA", opacity: 0.8 }}>
            {email}
          </span>
        ) : null}
        {onSignOut ? (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSignOut();
            }}
          >
            Sign out
          </a>
        ) : (
          <a href="contact.html">Contact</a>
        )}
      </nav>
    </header>
  );
}

export function PlatformFooter() {
  return (
    <footer className="p-footer">
      <div className="in">
        <div className="col">
          <span className="ttl">TAVA LABS</span>
          <a href="index.html">Home</a>
          <a href="quiz.html">Skin Quiz</a>
          <a href="app.html">My Account</a>
        </div>
        <div className="col">
          <span className="ttl">HELP</span>
          <a href="contact.html">Contact</a>
          <a href="faq.html">FAQs</a>
          <a href="shipping.html">Shipping</a>
          <a href="returns.html">Returns Policy</a>
        </div>
        <div className="col">
          <span className="ttl">CONTACT</span>
          <a href="mailto:talia@tavalabs.app">talia@tavalabs.app</a>
          <a href="tel:+19099061308">909-906-1308</a>
        </div>
      </div>
    </footer>
  );
}
