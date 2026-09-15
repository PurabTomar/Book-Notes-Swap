import { Link } from "react-router-dom";
import { timeAgo, formatPrice } from "../lib/format.js";

const conditionColor = {
  New: "#16a34a",
  Good: "#ca8a04",
  Fair: "#dc2626",
};

export default function ListingCard({ listing }) {
  const free =
    listing.is_free ||
    listing.price == null ||
    Number(listing.price) === 0;

  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      <div className="listing-card__img-wrap">
        {listing.photo_url ? (
          <img
            src={listing.photo_url}
            alt={listing.title}
            className="listing-card__img"
            loading="lazy"
          />
        ) : (
          <div className="listing-card__img-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path d="M4 16l4-4 3 3 5-5 4 4" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </div>
        )}
        {free && <span className="listing-card__badge listing-card__badge--free">Free</span>}
        <span
          className="listing-card__badge listing-card__badge--condition"
          style={{ background: conditionColor[listing.condition] }}
        >
          {listing.condition}
        </span>
      </div>
      <div className="listing-card__body">
        <h3 className="listing-card__title">{listing.title}</h3>
        <p className="listing-card__meta">
          {listing.subject} &middot; Sem {listing.semester}
        </p>
        <div className="listing-card__footer">
          <span className="listing-card__price">
            {free ? "Free" : formatPrice(listing)}
          </span>
          <time className="listing-card__time">{timeAgo(listing.created_at)}</time>
        </div>
      </div>
    </Link>
  );
}