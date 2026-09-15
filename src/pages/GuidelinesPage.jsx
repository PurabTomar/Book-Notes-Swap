import { Link } from "react-router-dom";

function Section({ num, title, children }) {
  return (
    <section className="guide-section">
      <h2 className="guide-section__title">
        <span className="guide-section__num">{num}</span>
        {title}
      </h2>
      <div className="guide-section__body">{children}</div>
    </section>
  );
}

export default function GuidelinesPage() {
  return (
    <main className="page page--form">
      <div className="browse-header">
        <h1 className="page__title">How it works &amp; community guidelines</h1>
        <p className="page__subtitle">
          Book &amp; Notes Swap is a free resource-sharing community for SATI students.
        </p>
      </div>

      <div className="guide">
        <Section num="1" title="Everything is FREE">
          <p>
            Every listing on this platform is shared free of charge. Nobody may ask for money —
            not for the book, notes, or "handling". If someone asks you to pay, that's a violation:
            please flag the listing using the "Report this listing" link.
          </p>
        </Section>

        <Section num="2" title="Well, almost everything">
          <p>
            Great study material stays great when it's treated well. Keep your listings honest:
            describe the actual resource, pick the right subject/semester, and use a real cover
            photo so your classmates know what they're getting.
          </p>
        </Section>

        <Section num="3" title="Meet safely">
          <p>
            Swap on campus, in libraries, or other public places. Never share your OTPs, UPI pins,
            or personal documents. If a conversation ever feels off, stop it and report it.
          </p>
        </Section>

        <Section num="4" title="Be kind">
          <p>
            Semester-end stress is real. Treat every poster like a friend — respond promptly, keep
            your word on pickups, and mark a listing as "given away" once it's been passed on, so
            others aren't left waiting.
          </p>
        </Section>

        <Section num="5" title="What not to post">
          <ul className="guide-list">
            <li>Anything that costs money or links to paid sites</li>
            <li>Spam, advertisements, or unrelated content</li>
            <li>Inappropriate, abusive, or harassing material</li>
            <li>Personally identifying details of others</li>
          </ul>
        </Section>

        <Section num="6" title="SATI Verified">
          <p>
            Sign up with a college email address and you'll earn a <span className="verified-badge">✓</span>{" "}
            verified badge, signalling to others that you're genuinely a student here. Verified
            students earn more trust on campus swaps.
          </p>
        </Section>

        <div className="guide-cta">
          <Link to="/browse" className="btn btn--primary">Start browsing</Link>
          <Link to="/new" className="btn btn--ghost">Share a resource</Link>
        </div>
      </div>
    </main>
  );
}