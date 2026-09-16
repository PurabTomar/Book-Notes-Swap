import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { timeAgo } from "../lib/format.js";
import { resolveCover, FALLBACK_IMAGE } from "../data/constants.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { getOrCreateConversation } from "../lib/chat.js";
import EmptyState from "../components/EmptyState.jsx";
import ListingCard from "../components/ListingCard.jsx";

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

function PhotoGallery({ photos, title }) {
  const [active, setActive] = useState(0);
  const good = photos.filter(Boolean);
  if (good.length === 0) return null;
  return (
    <div className="gallery">
      <img
        className="gallery__main"
        src={good[active]}
        alt={title}
        onError={(e) => {
          if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
        }}
      />
      {good.length > 1 && (
        <div className="gallery__thumbs">
          {good.map((src, i) => (
            <button
              key={src + i}
              className={`gallery__thumb ${i === active ? "gallery__thumb--active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
            >
              <img
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [listing, setListing] = useState(null);
  const [posterProfile, setPosterProfile] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(null);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      if (!isSupabaseConfigured) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
      } else {
        setListing(data);
        if (data.owner_id) {
          const { data: pp } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.owner_id)
            .maybeSingle();
          if (pp) setPosterProfile(pp);
        }
        // Related: same subject OR same branch+semester, excluding this one
        let rel = supabase
          .from("listings")
          .select("*")
          .eq("status", "available")
          .neq("id", id)
          .order("created_at", { ascending: false })
          .limit(12);
        const { data: subjMatch } = await supabase
          .from("listings")
          .select("*")
          .eq("status", "available")
          .eq("subject", data.subject)
          .neq("id", id)
          .limit(4);
        const { data: semMatch } = supabase
          ? await supabase
              .from("listings")
              .select("*")
              .eq("status", "available")
              .eq("semester", data.semester)
              .eq("branch", data.branch)
              .neq("id", id)
              .limit(4)
          : { data: [] };
        const seen = new Set();
        const merged = [...(subjMatch ?? []), ...(semMatch ?? [])].filter((r) => {
          if (seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        });
        let fallback = [];
        if (merged.length < 6) {
          const { data: fb } = await rel;
          fallback = (fb ?? []).filter((r) => !seen.has(r.id) && !merged.some((m) => m.id === r.id)).slice(0, 6 - merged.length);
        }
        setRelated([...merged, ...fallback].slice(0, 6));
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
      /* clipboard unavailable */
    }
  }

  async function handleContact() {
    setChatError("");
    if (!user) {
      navigate("/auth", { state: { from: `/listing/${id}` } });
      return;
    }
    if (listing.owner_id === user.id) {
      return; // own listing
    }
    setChatBusy(true);
    const { conversation, error } = await getOrCreateConversation({
      listingId: listing.id,
      otherUserId: listing.owner_id,
    });
    setChatBusy(false);
    if (error) {
      setChatError(typeof error === "string" ? error : "Could not start a chat right now.");
      return;
    }
    navigate(`/chat/${conversation.id}`);
  }

  async function handleReport(e) {
    e.preventDefault();
    setReportError("");
    if (!reportReason) {
      setReportError("Please choose a reason.");
      return;
    }
    setReportBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("reports").insert({
      listing_id: listing.id,
      reporter_id: u?.user?.id ?? null,
      reason: reportReason,
      details: reportDetails.trim() || null,
    });
    setReportBusy(false);
    if (error) {
      setReportError(error.message || "Could not submit the report.");
      return;
    }
    setReportSubmitted(true);
  }

  const posterName =
    posterProfile?.display_name ||
    (listing?.owner_id ? "SATI student" : "Anonymous poster");

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
          subtitle="It may have been removed already."
          action={<Link to="/browse" className="btn btn--primary">Back to Browse</Link>}
        />
      </main>
    );
  }

  const realPhotos = [
    ...(listing.photo_urls && Array.isArray(listing.photo_urls) ? listing.photo_urls : []),
    ...(Array.isArray(listing.photos) ? listing.photos.map((p) => p.url).filter(Boolean) : []),
  ];
  const photoUrls = realPhotos.length > 0
    ? realPhotos
    : [resolveCover(listing.subject, listing.photo_url)];
  const resourceType = listing.resource_type || "Other";
  const badgeStyle = RESOURCE_BADGE_COLORS[resourceType] || RESOURCE_BADGE_COLORS["Other"];
  const whatsappNumber = contactToWhatsAppNumber(listing.contact_whatsapp);
  const whatsappText = encodeURIComponent(
    `Hi! I'm interested in "${listing.title}" from Book & Notes Swap. Is it still available?`
  );
  const hasContact = listing.contact_email || listing.contact_phone || listing.contact_whatsapp;
  const showReveal = !listing.owner_id && hasContact;

  return (
    <main className="page page--detail">
      {listing.status === "sold" && (
        <div className="alert alert--info">This resource has been given away.</div>
      )}

      <Link to="/browse" className="back-link">&larr; Back to browse</Link>

      <div className="detail-layout">
        <div className="detail-media">
          <PhotoGallery photos={photoUrls} title={listing.title} />
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
            {listing.owner_id ? (
              <button className="btn btn--primary btn--full" onClick={handleContact} disabled={chatBusy || listing.owner_id === user?.id}>
                {listing.owner_id === user?.id
                  ? "This is your listing"
                  : chatBusy
                  ? "Starting chat..."
                  : "Contact poster"}
              </button>
            ) : showReveal ? (
              <>
                <h2 className="detail-contact__title">Get this resource</h2>
                {listing.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--whatsapp btn--full"
                  >
                    Chat on WhatsApp
                  </a>
                )}
                {listing.contact_phone && (
                  <a href={`tel:${listing.contact_phone}`} className={`btn btn--full ${listing.contact_whatsapp ? "btn--phone" : "btn--whatsapp"}`}>
                    Call {listing.contact_phone}
                  </a>
                )}
                {listing.contact_email && (
                  <a href={`mailto:${listing.contact_email}`} className={`btn btn--full ${listing.contact_whatsapp || listing.contact_phone ? "btn--phone" : "btn--whatsapp"}`}>
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
              </>
            ) : (
              <p className="form-hint">No contact details were shared for this listing.</p>
            )}

            {listing.owner_id && listing.owner_id !== user?.id && !user && (
              <p className="form-hint">You'll need an account to message the poster.</p>
            )}
            {chatError && <div className="form-error" style={{ width: "100%" }}>{chatError}</div>}
          </div>

          <div className="detail-shared">
            <div className="detail-shared__avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            </div>
            <div className="detail-shared__info">
              <strong>
                {posterName}
                {posterProfile?.is_sat_verified && (
                  <span className="verified-badge" title="SATI Verified student"> ✓</span>
                )}
              </strong>
              <span>
                {listing.branch ? `${listing.branch} · ` : ""}Semester {listing.semester}
              </span>
            </div>
          </div>

          <div className="detail-actions-row">
            <button className="report-btn" onClick={() => setReportOpen(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4M12 16h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
              Report this listing
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <h2 className="section-title">Similar resources</h2>
          <div className="grid">
            {related.map((r) => (
              <ListingCard key={r.id} listing={r} />
            ))}
          </div>
        </section>
      )}

      {reportOpen && (
        <div className="modal-overlay modal-overlay--open" onClick={() => setReportOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Report this listing</h3>
              <button onClick={() => setReportOpen(false)} aria-label="Close">&times;</button>
            </div>
            {reportSubmitted ? (
              <div className="form-success">Thanks — our team will review this listing shortly.</div>
            ) : (
              <form onSubmit={handleReport}>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <select className="form-input" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                    <option value="">Choose a reason...</option>
                    <option value="spam">Spam or scam</option>
                    <option value="inappropriate">Inappropriate content</option>
                    <option value="wrong-category">Wrong category / misleading title</option>
                    <option value="not-free">Asking for money</option>
                    <option value="other">Something else</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Details (optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Anything that helps us review faster..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                  />
                </div>
                {reportError && <div className="form-error">{reportError}</div>}
                <button type="submit" className="btn btn--danger btn--full" disabled={reportBusy}>
                  {reportBusy ? "Submitting..." : "Submit report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}