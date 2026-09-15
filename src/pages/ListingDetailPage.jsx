import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { timeAgo } from "../lib/format.js";
import { subjectImage, FALLBACK_IMAGE } from "../data/constants.js";
import EmptyState from "../components/EmptyState.jsx";

const RESOURCE_BADGE_COLORS = {
  "Handwritten Notes": { bg: "#f0fdf4", color: "#16a34a" },
  "PDF Notes": { bg: "#eff6ff", color: "#2563eb" },
  "Previous Year Paper": { bg: "#fef3c7", color: "#d97706" },
  "Lab Manual": { bg: "#fce7f3", color: "#db2777" },
  "Question Bank": { bg: "#f3e8ff", color: "#9333ea" },
  "Book": { bg: "#f0f9ff", color: "#0284c7" },
  "Assignment": { bg: "#ecfdf5", color: "#059669" },
  "Engineering Drawing": { bg: "#fff7ed", color: "#ea580c" },
  "Coding Resource": { bg: "#f8fafc", color: "#475569" },
  "Cheat Sheet": { bg: "#fefce8", color: "#ca8a04" },
  "Study Pack": { bg: "#fdf4ff", color: "#a21caf" },
  "Project Material": { bg: "#f0fdf4", color: "#15803d" },
  "Other": { bg: "#f9fafb", color: "#6b7280" },
};

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
    return () => {
      cancelled = true;
    };
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
            <Link to="/browse" className="btn btn--primary">Back to Browse</Link>
          }
        />
      </main>
    );
  }

  const detailImage = listing.image_url || listing.photo_url || subjectImage(listing.subject);
  const resourceType = listing.resource_type || "Other";
  const badgeStyle = RESOURCE_BADGE_COLORS[resourceType] || RESOURCE_BADGE_COLORS["Other"];
  const whatsappNumber = contactToWhatsAppNumber(listing.contact_whatsapp);
  const whatsappText = encodeURIComponent(
    `Hi! I'm interested in "${listing.title}" from Book & Notes Swap. Is it still available?`
  );

  return (
    <main className="page page--detail">
      {listing.status === "sold" && (
        <div className="alert alert--info">This resource has been shared with someone else.</div>
      )}

      <Link to="/browse" className="back-link">&larr; Back to browse</Link>

      <div className="detail-layout">
        <div className="detail-media">
          <img
            src={detailImage}
            alt={listing.title}
            className="detail-photo"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_IMAGE) {
                e.currentTarget.src = FALLBACK_IMAGE;
              }
            }}
          />
          <span className="detail-type-badge" style={{ background: badgeStyle.bg, color: badgeStyle.color }}>
            {resourceType}
          </span>
        </div>

        <div className="detail-info">
          <div className="detail-chips">
            <span className="chip">{listing.subject}</span>
            {listing.semester && <span className="chip">Semester {listing.semester}</span>}
            {listing.branch && <span className="chip">{listing.branch}</span>}
            {listing.condition && (
              <span className="chip" style={{ background: `${conditionColor[listing.condition]}1a`, color: conditionColor[listing.condition] }}>
                {listing.condition}
              </span>
            )}
          </div>

          <h1 className="detail-title">{listing.title}</h1>

          <div className="detail-free">
            <span className="detail-free__badge">FREE</span>
            <span className="detail-time">Posted {timeAgo(listing.created_at)}</span>
          </div>

          {listing.description && (
            <p className="detail-description">{listing.description}</p>
          )}

          <div className="detail-contact">
            <h2 className="detail-contact__title">Get this resource</h2>

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

          <div className="detail-shared">
            <div className="detail-shared__avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            </div>
            <div className="detail-shared__info">
              <strong>Shared by a SATI student</strong>
              <span>{listing.branch ? `${listing.branch} · ` : ""}Semester {listing.semester}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}