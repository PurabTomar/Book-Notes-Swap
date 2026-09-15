import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { formatPrice, timeAgo } from "../lib/format.js";
import EmptyState from "../components/EmptyState.jsx";

const conditionColor = {
  New: "#16a34a",
  Good: "#ca8a04",
  Fair: "#dc2626",
};

function contactToWhatsAppNumber(value) {
  return value.replace(/[^\d]/g, "");
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
      } else {
        setListing(data);
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // clipboard unavailable
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="detail-loading">
          <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 24, width: "60%", marginTop: 24 }} />
          <div className="skeleton" style={{ height: 16, width: "40%", marginTop: 12 }} />
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="page">
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
          }
          title="Listing not found"
          subtitle="It may have been removed, or Supabase isn't configured yet."
          action={
            <Link to="/" className="btn btn--primary">Back to Browse</Link>
          }
        />
      </main>
    );
  }

  const free = listing.is_free || listing.price == null || Number(listing.price) === 0;
  const whatsappNumber = contactToWhatsAppNumber(listing.contact_whatsapp);
  const whatsappText = encodeURIComponent(
    `Hi! I'm interested in your listing "${listing.title}" on Book & Notes Swap. Is it still available?`
  );

  return (
    <main className="page page--detail">
      {listing.status === "sold" && (
        <div className="alert alert--info">This item has been marked as sold.</div>
      )}

      <Link to="/" className="back-link">&larr; Back to browse</Link>

      <div className="detail-layout">
        <div className="detail-media">
          {listing.photo_url ? (
            <img src={listing.photo_url} alt={listing.title} className="detail-photo" />
          ) : (
            <div className="detail-photo detail-photo--empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>No photo</span>
            </div>
          )}
        </div>

        <div className="detail-info">
          <div className="detail-chips">
            <span className="chip">{listing.subject}</span>
            <span className="chip">Semester {listing.semester}</span>
            <span className="chip" style={{ background: `${conditionColor[listing.condition]}1a`, color: conditionColor[listing.condition] }}>
              {listing.condition}
            </span>
          </div>

          <h1 className="detail-title">{listing.title}</h1>

          <div className="detail-price">
            <span className={`price-tag ${free ? "price-tag--free" : ""}`}>
              {free ? "Free" : formatPrice(listing)}
            </span>
            <span className="detail-time">Posted {timeAgo(listing.created_at)}</span>
          </div>

          {listing.description && (
            <p className="detail-description">{listing.description}</p>
          )}

          <div className="detail-contact">
            <h2 className="detail-contact__title">Contact the seller</h2>

            {listing.contact_whatsapp && (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--whatsapp"
              >
                Chat on WhatsApp
              </a>
            )}

            {listing.contact_phone && (
              <a href={`tel:${listing.contact_phone}`} className={`btn ${listing.contact_whatsapp ? "btn--phone" : "btn--whatsapp"}`}>
                Call {listing.contact_phone}
              </a>
            )}

            {listing.contact_email && (
              <a href={`mailto:${listing.contact_email}`} className={`btn ${listing.contact_whatsapp || listing.contact_phone ? "btn--phone" : "btn--whatsapp"}`}>
                Email {listing.contact_email}
              </a>
            )}

            <div className="detail-copy-row">
              {listing.contact_phone && (
                <button className="link-btn" onClick={() => copy(listing.contact_phone, "phone")}>
                  {copied === "phone" ? "Copied!" : "Copy phone"}
                </button>
              )}
              {listing.contact_email && (
                <button className="link-btn" onClick={() => copy(listing.contact_email, "email")}>
                  {copied === "email" ? "Copied!" : "Copy email"}
                </button>
              )}
              {listing.contact_whatsapp && (
                <button className="link-btn" onClick={() => copy(listing.contact_whatsapp, "whatsapp")}>
                  {copied === "whatsapp" ? "Copied!" : "Copy WhatsApp"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}