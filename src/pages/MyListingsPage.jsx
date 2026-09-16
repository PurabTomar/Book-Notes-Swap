import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { timeAgo } from "../lib/format.js";
import { resolveCover, FALLBACK_IMAGE } from "../data/constants.js";
import EmptyState from "../components/EmptyState.jsx";

export default function MyListingsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState({ id: null, type: null, busy: false });
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false);
      if (!user) navigate("/auth", { state: { from: "/my-listings" } });
      return;
    }
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        if (!error) setListings(data ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  async function markClaimed(listing) {
    setAction({ id: listing.id, type: "claim", busy: true });
    const { error } = await supabase
      .from("listings")
      .update({ status: listing.status === "sold" ? "available" : "sold" })
      .eq("id", listing.id);
    setAction({ id: null, type: null, busy: false });
    if (error) setError(error.message);
    else {
      setError("");
      setRefreshKey((k) => k + 1);
    }
  }

  async function deleteListing() {
    if (!confirm) return;
    setAction({ id: confirm.id, type: "delete", busy: true });
    const { error } = await supabase.from("listings").delete().eq("id", confirm.id);
    setAction({ id: null, type: null, busy: false });
    setConfirm(null);
    if (error) setError(error.message);
    else {
      setError("");
      setRefreshKey((k) => k + 1);
    }
  }

  if (!user) {
    return (
      <main className="page">
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          title="Sign in to manage your listings"
          subtitle="Create an account to post and track resources you've shared."
          action={
            <button className="btn btn--primary" onClick={() => navigate("/auth", { state: { from: "/my-listings" } })}>
              Sign in / Sign up
            </button>
          }
        />
      </main>
    );
  }

  return (
    <main className="page">
      <div className="browse-header">
        <h1 className="page__title">My Listings</h1>
        <p className="page__subtitle" style={{ marginBottom: 16 }}>
          {profile?.display_name || "Welcome!"} — manage the resources you've shared.
        </p>
        {profile && (
          <div className="profile-card">
            <span className="profile-card__name">{profile.display_name || "You"}</span>
            <span className="profile-card__email">{profile.email}</span>
            {profile.is_sat_verified ? (
              <span className="verified-badge verified-badge--big" title="College email confirmed">SATI Verified ✓</span>
            ) : (
              <span className="profile-card__hint">Tip: sign up with a college email to get the SATI Verified badge.</span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "18px 0 6px" }}>
        <Link to="/new" className="btn btn--primary">+ Share new resource</Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div style={{ marginTop: 20 }} className="conversation-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton" style={{ height: 120, borderRadius: 14, marginBottom: 12 }} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
          title="You haven't shared anything yet"
          subtitle="Post your first free resource and help a fellow student."
          action={<Link to="/new" className="btn btn--primary">Share a resource</Link>}
        />
      ) : (
        <div className="my-listing-list" style={{ marginTop: 20 }}>
          {listings.map((l) => (
            <div className={`my-listing ${l.status === "sold" ? "my-listing--claimed" : ""}`} key={l.id}>
              <Link to={`/listing/${l.id}`} className="my-listing__img">
                <img
                  src={resolveCover(l.subject, l.photo_url)}
                  alt={l.title}
                  onError={(e) => {
                    if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </Link>
              <div className="my-listing__body">
                <div className="my-listing__title">{l.title}</div>
                <div className="my-listing__meta">
                  {l.subject} · Sem {l.semester}
                  {l.branch ? ` · ${l.branch}` : ""} · Posted {timeAgo(l.created_at)}
                </div>
                {l.status === "sold" && <div className="my-listing__badge">Given away</div>}
              </div>
              <div className="my-listing__actions">
                <button className="btn btn--sm btn--ghost" onClick={() => markClaimed(l)} disabled={action.busy}>
                  {l.status === "sold" ? "Mark available" : "Mark given away"}
                </button>
                <Link to={`/listing/${l.id}`} className="btn btn--sm btn--ghost">View</Link>
                <Link to={`/listing/${l.id}/edit`} className="btn btn--sm btn--ghost">Edit</Link>
                <button
                  className="btn btn--sm btn--danger"
                  onClick={() => setConfirm(l)}
                  disabled={action.busy}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <div className="modal-overlay modal-overlay--open" onClick={() => setConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Delete this listing?</h3>
              <button onClick={() => setConfirm(null)} aria-label="Close">&times;</button>
            </div>
            <p className="form-hint" style={{ margin: "6px 0 16px" }}>
              "{confirm.title}" will be removed from Browse immediately. This can't be undone.
            </p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className="btn btn--danger"
                onClick={deleteListing}
                disabled={action.busy}
              >
                {action.busy ? "Deleting..." : "Delete listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}