import { Link } from "react-router-dom";
import { timeAgo } from "../lib/format.js";
import { subjectImage, FALLBACK_IMAGE } from "../data/constants.js";

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

export default function ListingCard({ listing }) {
  const free = listing.is_free || listing.price == null || Number(listing.price) === 0;
  const cardImage = listing.photo_url || subjectImage(listing.subject);
  const resourceType = listing.resource_type || "Other";
  const badgeStyle = RESOURCE_BADGE_COLORS[resourceType] || RESOURCE_BADGE_COLORS["Other"];

  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      <div className="listing-card__img-wrap">
        <img
          src={cardImage}
          alt={listing.title}
          className="listing-card__img"
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== window.location.origin + FALLBACK_IMAGE) {
              e.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
        />
        {free && <span className="listing-card__badge listing-card__badge--free">FREE</span>}
      </div>
      <div className="listing-card__body">
        <div className="listing-card__badges">
          <span className="listing-card__type-badge" style={{ background: badgeStyle.bg, color: badgeStyle.color }}>
            {resourceType}
          </span>
          {listing.condition === "New" && (
            <span className="listing-card__type-badge" style={{ background: "#f0fdf4", color: "#16a34a" }}>NEW</span>
          )}
        </div>
        <h3 className="listing-card__title">{listing.title}</h3>
        <p className="listing-card__desc">{listing.description || listing.subject}</p>
        <div className="listing-card__footer">
          <span className="listing-card__meta">
            {listing.semester && `Sem ${listing.semester}`}
            {listing.branch && ` · ${listing.branch}`}
          </span>
          <time className="listing-card__time">{timeAgo(listing.created_at)}</time>
        </div>
      </div>
    </Link>
  );
}